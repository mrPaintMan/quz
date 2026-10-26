import type { ScreenView } from "@/domain/screenSequence/describeScreen";

// What a team's phone says while the game is on a screen; answer inputs come in M3.
export function phoneScreenText(view: ScreenView): string {
  switch (view.kind) {
    case "lobby":
      return "Ni är med! Vi börjar snart.";
    case "question":
      return view.answeredInApp ? "Frågan visas på TV:n." : "Aktivitet pågår.";
    case "film":
      return "Titta på filmen.";
    default:
      return "Titta på TV:n.";
  }
}
