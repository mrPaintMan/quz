import type { TeamColour } from "@/domain/teams/teamColours";

// Shades picked to stand apart on the dark plum background; the final look comes with the
// Christmas theme (M5).
export const TEAM_COLOUR_HEX: Record<TeamColour, string> = {
  red: "#e0645f",
  orange: "#e8924b",
  yellow: "#e8c94b",
  lime: "#a8cf5a",
  green: "#5fb37f",
  teal: "#4fb3a6",
  cyan: "#5ec4dc",
  blue: "#6f95e0",
  indigo: "#8c7ff0",
  purple: "#c07fd8",
  pink: "#e57fb0",
  brown: "#b48a63",
};

// For screen readers and the colour picker's labels.
export const TEAM_COLOUR_NAMES: Record<TeamColour, string> = {
  red: "Röd",
  orange: "Orange",
  yellow: "Gul",
  lime: "Limegrön",
  green: "Grön",
  teal: "Blågrön",
  cyan: "Turkos",
  blue: "Blå",
  indigo: "Indigo",
  purple: "Lila",
  pink: "Rosa",
  brown: "Brun",
};
