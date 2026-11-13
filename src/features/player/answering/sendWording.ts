import type { AnsweredType } from "@convex/answers/answerContent";

// What the phone says around sending an answer: the note above the button, the button, and the
// line once sent. A trip's guess is sent by pulling the emergency brake, a red button (D63).
export type SendWording = { hint: string; button: string; sent: string; isBrake: boolean };

const SEND: SendWording = { hint: "Svaret låses när ni skickar det.", button: "Skicka svar", sent: "Svar skickat ✓", isBrake: false };
const BRAKE: SendWording = {
  hint: "Bromsa när ni vet. Gissningen låses och får poängen som visas då.",
  button: "Dra i nödbromsen",
  sent: "Bromsat ✓",
  isBrake: true,
};

export const sendWordingOf = (type: AnsweredType): SendWording => (type === "paSparet" ? BRAKE : SEND);
