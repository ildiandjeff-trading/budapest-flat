export type Stay = {
  id: string;
  guest_name: string;
  start_date: string; // check-in, yyyy-MM-dd
  end_date: string; // check-out, yyyy-MM-dd
  guests: number;
  color: string;
  notes: string | null;
};

export type GuideSection = {
  id: string;
  title: string;
  icon: string;
  body: string;
  position: number;
  title_hu?: string | null;
  body_hu?: string | null;
};

export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssueUrgency = "low" | "normal" | "urgent";

export type Issue = {
  id: string;
  title: string;
  details: string | null;
  area: string;
  urgency: IssueUrgency;
  reported_by: string | null;
  status: IssueStatus;
  created_at: string;
  resolved_at: string | null;
};

export const STAY_COLORS = ["#c8553d", "#2b6cb0", "#2f855a", "#b7791f", "#805ad5", "#d53f8c", "#0f766e", "#4a5568"];
