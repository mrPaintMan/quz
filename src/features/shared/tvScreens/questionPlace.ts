// How a question screen names its question, on the TV and in the live control: "Fråga 3", or
// "Aktivitet" for one not answered in the app, which takes no number (D54).
export function questionPlace({ answeredInApp, questionNumber }: { answeredInApp: boolean; questionNumber: number }): string {
  return answeredInApp ? `Fråga ${questionNumber}` : "Aktivitet";
}
