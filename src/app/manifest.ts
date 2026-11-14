import type { MetadataRoute } from "next";

// Lets Android (and other browsers) install the app with a proper icon and open it full-screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jildi's Budapest Nest",
    short_name: "Jildi's Nest",
    description: "Who's staying when, and everything guests need to know.",
    start_url: "/calendar",
    scope: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#f4f6fb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
