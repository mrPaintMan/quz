import { formatClock } from "@/domain/time/formatClock";

// The timer as the TV, phones and hosts show it, such as "0:42".
export function timeLeftText(secondsLeft: number): string {
  return secondsLeft > 0 ? formatClock(secondsLeft) : "Tiden är ute!";
}
