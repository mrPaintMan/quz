"use client";

import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { pointsLeft } from "@/domain/questionTypes/drawing/drawingLimits";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";
import { DrawingPicture, strokePath } from "@/features/shared/drawing/DrawingPicture";
import { PENS, penHex, type PenColour } from "@/features/shared/drawing/penColours";

// Points closer together than this, in parts of the canvas, add nothing a viewer would see.
const MIN_STEP = 0.004;
const round = (value: number) => Math.round(Math.min(Math.max(value, 0), 1) * 1000) / 1000;

// The team draws with a finger in one of five pens; Ångra takes back the last stroke and Rensa
// clears the paper (D62). Each finished stroke is a change, saved as a draft like any answer.
export function DrawingInput({ answer, disabled, onChange }: AnswerInputProps<"drawing">) {
  const strokes = answer?.strokes ?? [];
  const [colour, setColour] = useState<PenColour>("black");
  const [stroke, setStroke] = useState<number[] | null>(null);
  const paper = useRef<SVGSVGElement>(null);
  const room = pointsLeft({ type: "drawing", strokes }) - (stroke?.length ?? 0) / 2;

  const pointAt = (event: PointerEvent) => {
    const box = paper.current!.getBoundingClientRect();
    return [round((event.clientX - box.left) / box.width), round((event.clientY - box.top) / box.height)];
  };
  const finish = () => {
    if (stroke) onChange({ type: "drawing", strokes: [...strokes, { colour, points: stroke }] });
    setStroke(null);
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
          if (room < 1) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          setStroke(pointAt(event));
        }}
        onPointerMove={(event) => {
          if (!stroke || room < 1) return;
          const [x, y] = pointAt(event);
          const [lastX, lastY] = stroke.slice(-2);
          if (Math.hypot(x - lastX, y - lastY) >= MIN_STEP) setStroke([...stroke, x, y]);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {stroke && <path d={strokePath(stroke)} fill="none" stroke={penHex(colour)} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
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
      {room < 1 && <p className="text-sm text-muted-foreground">Pappret är fullt.</p>}
    </div>
  );
}
