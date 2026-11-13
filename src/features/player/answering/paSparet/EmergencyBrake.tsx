"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

// How far down the handle travels, in px, and how much of it counts as pulled.
const TRAVEL = 150;
const PULLED_AT = 0.9;
// The chain the handle hangs from at rest, in px; each link adds 11 px of chain and, as the links
// overlap, 10 px of drawn length.
const CHAIN = 70;
const LINK = 11;
const DRAWN_LINK = 10;
const HANDLE_HEIGHT = 149;

type EmergencyBrakeProps = {
  points: number;
  // Whether the brake may be pulled at all; false while a pull is being sent or once locked.
  disabled: boolean;
  // Called once the handle is pulled past the line; true if the pull counts, false to spring back.
  onPull: () => boolean;
};

// The chain from the rail to the handle, its links alternating ring and bar.
function Chain({ length }: { length: number }) {
  const count = Math.max(1, Math.floor(length / LINK));
  return (
    <div aria-hidden="true" className="absolute top-5 left-1/2 -ml-2 flex w-4 flex-col items-center">
      {Array.from({ length: count }, (_, index) =>
        index % 2 === 0 ? (
          <span key={index} className="-mt-[3px] box-border h-3.5 w-[9px] rounded-[5px] border-[2.5px] border-muted-foreground" />
        ) : (
          <span key={index} className="-mt-[3px] h-3 w-[3px] rounded-sm bg-muted-foreground" />
        ),
      )}
    </div>
  );
}

// The red handle, drawn as in the wireframe.
function Handle() {
  return (
    <svg width="150" height={HANDLE_HEIGHT} viewBox="490 200 1020 1015" aria-hidden="true" className="pointer-events-none block">
      <path d="M854 200 H1146 V266 C1146 279 1136 290 1123 290 H1105 V420 H895 V290 H877 C864 290 854 279 854 266 Z" fill="#B8262C" />
      <path
        fillRule="evenodd"
        fill="#DC2F35"
        d="M575 407 H1425 C1480 425 1510 480 1510 550 V710 C1460 765 1425 815 1442 830 C1475 890 1495 960 1493 1020 C1490 1110 1440 1180 1365 1212 C1358 1214 1352 1215 1345 1215 H655 C648 1215 642 1214 635 1212 C560 1180 510 1110 507 1020 C505 960 525 890 558 830 C575 815 540 765 490 710 V550 C490 480 520 425 575 407 Z M785 797 H1215 C1222 797 1228 800 1232 805 C1280 860 1320 940 1312 1018 C1305 1050 1270 1085 1180 1090 H820 C730 1085 695 1050 688 1018 C680 940 720 860 768 805 C772 800 778 797 785 797 Z"
      />
      <text x="1000" y="652" textAnchor="middle" fill="#FFFFFF" fontSize="128" fontWeight="700" fontFamily="ui-monospace, 'SF Mono', Menlo, monospace">
        NÖDBROMS
      </text>
    </svg>
  );
}

// The emergency brake hanging on its chain: the team drags the handle down past the dashed line
// and lets go to pull it; let go too early and it springs back (D63). Enter or Space pulls it too.
export function EmergencyBrake({ points, disabled, onPull }: EmergencyBrakeProps) {
  // How far the handle is pulled, 0 to 1; kept in a ref too, so the spring reads it between renders.
  const [pull, setPullState] = useState(0);
  const pullNow = useRef(0);
  const setPull = useCallback((value: number) => {
    pullNow.current = value;
    setPullState(value);
  }, []);
  const drag = useRef<{ pointerId: number; startY: number } | null>(null);
  const frame = useRef<number | null>(null);
  const isReady = pull > PULLED_AT;

  const stopSpring = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  const springBack = useCallback(() => {
    stopSpring();
    const step = () => {
      const next = pullNow.current * 0.7;
      setPull(next < 0.01 ? 0 : next);
      frame.current = next < 0.01 ? null : requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [setPull, stopSpring]);
  useEffect(() => stopSpring, [stopSpring]);
  // A pull stays down while it is sent; if sending fails, the brake is free again and springs back.
  useEffect(() => {
    if (!disabled && pullNow.current > PULLED_AT) springBack();
  }, [disabled, springBack]);

  const release = (pulledFar: boolean) => {
    if (pulledFar && onPull()) {
      setPull(1);
      navigator.vibrate?.(200);
    } else springBack();
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || drag.current) return;
    stopSpring();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { pointerId: event.pointerId, startY: event.clientY - pullNow.current * TRAVEL };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    setPull(Math.min(Math.max((event.clientY - drag.current.startY) / TRAVEL, 0), 1));
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    release(pullNow.current > PULLED_AT);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    release(true);
  };

  const offset = Math.round(pull * TRAVEL);
  const chainLength = CHAIN + offset;
  // The handle hangs from the last link.
  const handleTop = 20 + Math.max(1, Math.floor(chainLength / LINK)) * DRAWN_LINK - 2;
  const lineTop = 20 + CHAIN + TRAVEL + HANDLE_HEIGHT - 14;

  return (
    <div className="relative min-h-[400px] flex-1 touch-none overflow-hidden rounded-[20px] border bg-card">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-3.5 border-b bg-secondary" />
      <div aria-hidden="true" className="absolute top-2.5 left-1/2 -ml-3 h-2.5 w-6 rounded-b-md bg-muted-foreground/60" />
      {/* Once at the line, the heading says what letting go does, where the handle can't hide it. */}
      <p aria-live="polite" className={`absolute top-5 left-3.5 text-sm ${isReady ? "font-semibold text-primary" : "text-muted-foreground"}`}>
        {isReady ? `Släpp för att svara på ${points} p` : "Dra ned för att svara"}
      </p>
      <div
        aria-hidden="true"
        className={`absolute inset-x-4 flex justify-end border-t-2 border-dashed ${isReady ? "border-primary" : "border-border"}`}
        style={{ top: lineTop }}
      >
        {!isReady && <span className="mt-1 text-xs font-semibold text-muted-foreground">Dra hit</span>}
      </div>
      <Chain length={chainLength} />
      <div
        role="slider"
        aria-label="Nödbroms, dra ned för att svara"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pull * 100)}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`absolute left-1/2 -ml-[75px] w-[150px] touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring ${disabled ? "" : "cursor-grab active:cursor-grabbing"}`}
        style={{ top: handleTop }}
      >
        <Handle />
      </div>
    </div>
  );
}
