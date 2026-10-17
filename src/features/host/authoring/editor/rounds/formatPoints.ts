import { formatDecimal } from "@/domain/text/formatDecimal";

// "2 p", or "– p" when the question has no fixed maximum (open lists).
export function formatPoints(points: number | null): string {
  return points === null || Number.isNaN(points) ? "– p" : `${formatDecimal(points)} p`;
}
