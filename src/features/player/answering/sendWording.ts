import type { AnsweredType } from "@convex/answers/answerContent";
import { sendsWithBrake } from "@/domain/answering/registry";

// What the phone says around sending an answer: the note above the button, the button, and the
// line once sent. A trip's guess is sent by pulling the emergency brake, a red button (D63).
export type SendWording = { hint: string; button: string; sent: string; isBrake: boolean };

const SEND: SendWording = { hint: "Svaret låses när ni skickar det.", button: "Skicka svar", sent: "Svar skickat ✓", isBrake: false };
const BRAKE: SendWording = {
  hint: "Bromsa när ni vet. Gissningen låses och får poängen som visas då.",
  button: "Dra i nödbromsen",
  // The guess itself says whether it braked, as a guess left unbraked also locks (D63).
  sent: "Gissningen är låst.",
  isBrake: true,
};

export const sendWordingOf = (type: AnsweredType): SendWording => (sendsWithBrake(type) ? BRAKE : SEND);
