// How a question screen names its question, on the TV and in the live control: "Fråga 3", or
// "Aktivitet" for one not answered in the app, which takes no number (D54).
export function questionPlace({ answeredInApp, questionNumber }: { answeredInApp: boolean; questionNumber: number }): string {
  return answeredInApp ? `Fråga ${questionNumber}` : "Aktivitet";
}

// The small line over a question or answer screen's title: its round and place, or "På spåret" for
// the trip, which has a round of its own (D66).
export function screenEyebrow(view: { kind: "question" | "answer"; roundNumber: number; questionNumber: number; answeredInApp?: boolean; isTrip: boolean }): string {
  if (view.isTrip) return "På spåret";
  const place = view.kind === "answer" ? `Svar på fråga ${view.questionNumber}` : questionPlace({ answeredInApp: view.answeredInApp ?? true, questionNumber: view.questionNumber });
  return `Omgång ${view.roundNumber} · ${place}`;
}
