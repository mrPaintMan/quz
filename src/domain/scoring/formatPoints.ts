import { formatDecimal } from "@/domain/text/formatDecimal";

// Points as the TV, phones and hosts show them, with a Swedish decimal comma: "12 p", "2,5 p".
export function formatPoints(points: number): string {
  return `${formatDecimal(points)} p`;
}
