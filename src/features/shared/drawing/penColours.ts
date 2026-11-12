import type { AnswerOf } from "@convex/answers/answerContent";

export type PenColour = AnswerOf<"drawing">["strokes"][number]["colour"];

// The five pens, in the order the phone offers them, with their ink on white paper and their names
// for screen readers (D62).
export const PENS: { colour: PenColour; hex: string; name: string }[] = [
  { colour: "black", hex: "#1f1a24", name: "Svart" },
  { colour: "red", hex: "#d62f2f", name: "Röd" },
  { colour: "green", hex: "#2e8b4a", name: "Grön" },
  { colour: "blue", hex: "#2f62d6", name: "Blå" },
  { colour: "orange", hex: "#ee8a1c", name: "Orange" },
];

export const penHex = (colour: PenColour) => PENS.find((pen) => pen.colour === colour)?.hex ?? PENS[0].hex;
