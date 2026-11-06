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
};

export const STAY_COLORS = ["#c8553d", "#2b6cb0", "#2f855a", "#b7791f", "#805ad5", "#d53f8c", "#0f766e", "#4a5568"];
