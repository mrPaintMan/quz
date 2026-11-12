import type { SVGProps } from "react";
import type { AnswerOf } from "@convex/answers/answerContent";
import { penHex } from "./penColours";

type Stroke = AnswerOf<"drawing">["strokes"][number];

// The canvas is 4:3; points are stored as 0–1 of its width and height (D62).
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 300;
const PEN_WIDTH = 5;

// A stroke as an SVG path; a single point is drawn as a dot.
export function strokePath(points: number[]): string {
  const at = (index: number) => `${points[index] * CANVAS_WIDTH} ${points[index + 1] * CANVAS_HEIGHT}`;
  if (points.length < 4) return points.length < 2 ? "" : `M ${at(0)} l 0.1 0`;
  const rest = [];
  for (let index = 2; index < points.length - 1; index += 2) rest.push(`L ${at(index)}`);
  return `M ${at(0)} ${rest.join(" ")}`;
}

// A team's drawing on white paper, the same on the phone and the TV at any size.
export function DrawingPicture({ strokes, label, ...props }: { strokes: Stroke[]; label: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} role="img" aria-label={label} {...props}>
      <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" />
      {strokes.map((stroke, index) => (
        <path
          key={index}
          d={strokePath(stroke.points)}
          fill="none"
          stroke={penHex(stroke.colour)}
          strokeWidth={PEN_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {props.children}
    </svg>
  );
}
