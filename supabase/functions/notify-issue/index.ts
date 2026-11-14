// Emails the hosts when a guest reports an issue, sent from the hosts' Gmail account.
// Secrets: GMAIL_USER, GMAIL_APP_PASSWORD (a Google app password), optional NOTIFY_TO (comma-separated).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const URGENCY: Record<string, string> = { low: "Minor", normal: "Needs fixing", urgent: "URGENT" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const user = Deno.env.get("GMAIL_USER");
  const pass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!user || !pass) return json({ sent: false, reason: "Gmail is not set up yet" });
  const to = Deno.env.get("NOTIFY_TO") || user;

  // Only signed-in members of the flat app may trigger an email.
  const authed = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: isMember } = await authed.rpc("is_member");
  if (!isMember) return json({ error: "Not allowed" }, 403);

  const { id, appUrl } = await req.json().catch(() => ({}));
  if (!id) return json({ error: "Missing issue id" }, 400);
  const { data: issue, error } = await authed.from("issues").select("*").eq("id", id).single();
  if (error || !issue) return json({ error: "Issue not found" }, 404);

  const urgency = URGENCY[issue.urgency] ?? issue.urgency;
  const link = typeof appUrl === "string" && /^https:\/\//.test(appUrl) ? `${appUrl.replace(/\/$/, "")}/issues` : null;
  const subject = `${issue.urgency === "urgent" ? "🚨 URGENT: " : ""}Budapest flat issue: ${issue.title}`;
  const text = [
    `A guest reported a problem at the Budapest flat.`,
    ``,
    `What: ${issue.title}`,
    `Where: ${issue.area}`,
    `Urgency: ${urgency}`,
    issue.reported_by ? `Reported by: ${issue.reported_by}` : null,
    issue.details ? `\nDetails:\n${issue.details}` : null,
    link ? `\nOpen the app: ${link}` : null,
  ].filter((l) => l !== null).join("\n");
  const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#0f1d3a">
  <div style="background:#1b3366;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
    <div style="font-size:12px;letter-spacing:2px;opacity:.7;text-transform:uppercase">Jildi's Budapest Nest</div>
    <div style="font-size:22px;font-weight:600;margin-top:4px">New issue reported</div>
  </div>
  <div style="border:1px solid #e2e7f0;border-top:0;padding:20px 24px;border-radius:0 0 14px 14px">
    ${issue.urgency === "urgent" ? `<div style="background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;border-radius:10px;padding:8px 12px;font-weight:600;margin-bottom:14px">Marked as URGENT</div>` : ""}
    <div style="font-size:18px;font-weight:600">${esc(issue.title)}</div>
    <table style="margin-top:12px;font-size:14px;border-collapse:collapse">
      <tr><td style="color:#5f6b85;padding:3px 16px 3px 0">Where</td><td>${esc(issue.area)}</td></tr>
      <tr><td style="color:#5f6b85;padding:3px 16px 3px 0">Urgency</td><td>${esc(urgency)}</td></tr>
      ${issue.reported_by ? `<tr><td style="color:#5f6b85;padding:3px 16px 3px 0">Reported by</td><td>${esc(issue.reported_by)}</td></tr>` : ""}
    </table>
    ${issue.details ? `<p style="white-space:pre-line;font-size:14px;line-height:1.5;margin-top:14px">${esc(issue.details)}</p>` : ""}
    ${link ? `<a href="${esc(link)}" style="display:inline-block;margin-top:16px;background:#1b3366;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600">Open in the app</a>` : ""}
  </div>
</div>`;

  try {
    const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } });
    await transport.sendMail({ from: `"Budapest Nest" <${user}>`, to, subject, text, html });
    return json({ sent: true });
  } catch (e) {
    console.error("send failed", e);
    return json({ sent: false, reason: "Email could not be sent" }, 502);
  }
});
