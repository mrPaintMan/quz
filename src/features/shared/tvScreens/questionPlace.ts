import type { ScreenView } from "@/domain/screenSequence/describeScreen";

// How a question screen names its question, on the TV and in the live control: "Fråga 3", or
// "Aktivitet" for one not answered in the app, which takes no number (D54).
export function questionPlace({ answeredInApp, questionNumber }: { answeredInApp: boolean; questionNumber: number }): string {
  return answeredInApp ? `Fråga ${questionNumber}` : "Aktivitet";
}

// A round as the TV and the live control name it.
export const roundLabel = (roundNumber: number) => `Omgång ${roundNumber}`;

type QuestionView = Extract<ScreenView, { kind: "question" }>;
type AnswerView = Extract<ScreenView, { kind: "answer" }>;

// The small line over a question or answer screen's title: its round and place, or "På spåret" for
// the trip, which has a round of its own (D66).
export function screenEyebrow(view: Pick<QuestionView, "kind" | "roundNumber" | "questionNumber" | "answeredInApp" | "isTrip"> | Pick<AnswerView, "kind" | "roundNumber" | "questionNumber" | "isTrip">): string {
  if (view.isTrip) return "På spåret";
  const place = view.kind === "answer" ? `Svar på fråga ${view.questionNumber}` : questionPlace(view);
  return `${roundLabel(view.roundNumber)} · ${place}`;
}
