"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { MAX_STROKES, pointsLeft } from "@/domain/questionTypes/drawing/drawingLimits";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { DrawingPicture, StrokePath } from "@/features/shared/drawing/DrawingPicture";
import { PENS, type PenColour } from "@/features/shared/drawing/penColours";

// Points closer together than this, in parts of the canvas, add nothing a viewer would see.
const MIN_STEP = 0.004;
const round = (value: number) => Math.round(Math.min(Math.max(value, 0), 1) * 1000) / 1000;

// The stroke being drawn and the finger drawing it; other fingers and palms are ignored.
type Drawing = { pointerId: number; points: number[] };

// The team draws with a finger in one of five pens; Ångra takes back the last stroke and Rensa
// clears the paper (D62). Each finished stroke is a change, saved as a draft like any answer.
export function DrawingInput({ answer, disabled, onChange }: AnswerInputProps<"drawing">) {
  const strokes = answer?.strokes ?? [];
  const [colour, setColour] = useState<PenColour>("black");
  // Kept in a ref so pointer events arriving between renders all add to the same stroke; the
  // state only redraws it.
  const drawing = useRef<Drawing | null>(null);
  const [shownStroke, setShownStroke] = useState<number[] | null>(null);
  const paper = useRef<SVGSVGElement>(null);
  const isFull = strokes.length >= MAX_STROKES || pointsLeft({ type: "drawing", strokes }) < 1;

  const pointAt = (event: PointerEvent) => {
    const box = paper.current!.getBoundingClientRect();
    return [round((event.clientX - box.left) / box.width), round((event.clientY - box.top) / box.height)];
  };
  const isDrawingWith = (event: PointerEvent) => drawing.current !== null && drawing.current.pointerId === event.pointerId;
  const finish = (event: PointerEvent) => {
    if (!isDrawingWith(event)) return;
    onChange({ type: "drawing", strokes: [...strokes, { colour, points: drawing.current!.points }] });
    drawing.current = null;
    setShownStroke(null);
  };

  if (disabled) return <DrawingPicture strokes={strokes} label="Er teckning" className="w-full rounded-xl" />;
  return (
    <div className="flex flex-col gap-3">
      <DrawingPicture
        ref={paper}
        strokes={strokes}
        label="Rita här"
        className="w-full touch-none rounded-xl"
        onPointerDown={(event) => {
          if (isFull || drawing.current !== null) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          drawing.current = { pointerId: event.pointerId, points: pointAt(event) };
          setShownStroke(drawing.current.points);
        }}
        onPointerMove={(event) => {
          if (!isDrawingWith(event)) return;
          const current = drawing.current!;
          if (current.points.length / 2 >= pointsLeft({ type: "drawing", strokes })) return;
          const [x, y] = pointAt(event);
          const [lastX, lastY] = current.points.slice(-2);
          if (Math.hypot(x - lastX, y - lastY) < MIN_STEP) return;
          current.points.push(x, y);
          setShownStroke([...current.points]);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {shownStroke && <StrokePath points={shownStroke} colour={colour} />}
      </DrawingPicture>
      <div className="flex items-center gap-2">
        {PENS.map((pen) => (
          <button
            key={pen.colour}
            type="button"
            aria-label={pen.name}
            aria-pressed={pen.colour === colour}
            onClick={() => setColour(pen.colour)}
            className={`size-9 rounded-full border-2 ${pen.colour === colour ? "border-primary ring-2 ring-primary" : "border-border"}`}
            style={{ backgroundColor: pen.hex }}
          />
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" disabled={strokes.length === 0} onClick={() => onChange({ type: "drawing", strokes: strokes.slice(0, -1) })}>
            Ångra
          </Button>
          <Button variant="outline" size="sm" disabled={strokes.length === 0} onClick={() => onChange({ type: "drawing", strokes: [] })}>
            Rensa
          </Button>
        </div>
      </div>
      {isFull && <p className="text-sm text-muted-foreground">Pappret är fullt.</p>}
    </div>
  );
}
