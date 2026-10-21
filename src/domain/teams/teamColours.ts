// One colour per team, so the number of colours is also the most teams a game can have.
// Their shades are set by the TV and phone design.
export const TEAM_COLOURS = [
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "pink",
  "brown",
] as const;

export type TeamColour = (typeof TEAM_COLOURS)[number];
