import type { CSSProperties, ReactNode } from "react";
import type { OutcomePart } from "@/domain/answering/outcome";
import { formatPoints } from "@/domain/scoring/formatPoints";

// Parts light up one after another, this far apart.
const STAGGER_MS = 150;

// How a part of the team's answer looks once shown: lit in gold when it scored, as sent otherwise;
// dashed while waiting for a verdict, faded when another form of it already counted (D59).
export function resultClass(result: OutcomePart["result"] | undefined): string {
  switch (result) {
    case "right":
      return "result-lit";
    case "pending":
      return "border-2 border-dashed border-muted-foreground";
    case "repeat":
      return "opacity-45";
    default:
      return "";
  }
}

// Each lit part's place in the order they light up.
export const glowDelay = (order: number): CSSProperties => ({ animationDelay: `${order * STAGGER_MS}ms` });

// A dark pill on a lit part: its points in gold, or on a wrong Flerval pick a red note.
export function Pill({ children, tone = "gold", className = "" }: { children: ReactNode; tone?: "gold" | "red"; className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full bg-background px-2.5 py-0.5 text-sm font-bold whitespace-nowrap ${tone === "gold" ? "text-primary" : "text-destructive"} ${className}`}
    >
      {children}
    </span>
  );
}

// A lit part's own points.
export function PointsBadge({ points, className }: { points: number; className?: string }) {
  return <Pill className={className}>+{formatPoints(points)}</Pill>;
}

// Each part's place in the order the parts that scored light up; 0 for the others, which don't.
export function litOrders(parts: (OutcomePart | undefined)[]): number[] {
  let lit = 0;
  return parts.map((part) => (part?.result === "right" ? lit++ : 0));
}

// Why a part gave nothing yet, under its text: waiting for a verdict, or already counted.
export function ResultNote({ result }: { result: OutcomePart["result"] | undefined }) {
  if (result === "pending") return <span className="text-sm text-muted-foreground">Bedöms…</span>;
  if (result === "repeat") return <span className="text-sm text-muted-foreground">Räknas redan</span>;
  return null;
}

// What a part shows at its end: its points when it scored.
export function PartEnd({ part }: { part: OutcomePart | undefined }) {
  return part?.result === "right" ? <PointsBadge points={part.points} /> : null;
}
