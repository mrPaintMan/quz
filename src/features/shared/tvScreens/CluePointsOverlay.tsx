"use client";

import { useEffect, useState } from "react";

const FADE_MS = 500;

// The trip's current points in the film's lower-left corner, and nothing else, sized in the
// film's own units (FilmFrame): the digits are about a fifth of the film's height. A new number
// waits for the old one to fade out, so two never show at once. The wait is a timer rather than
// the end of the fade, which never comes when the browser skips animations.
export function CluePointsOverlay({ points }: { points: number | null }) {
  const [shown, setShown] = useState(points);
  // Nothing to fade out first: the number appears, and fades in, at once.
  if (shown === null && points !== null) setShown(points);
  const isFadingOut = shown !== points;

  useEffect(() => {
    if (!isFadingOut) return;
    const swap = setTimeout(() => setShown(points), FADE_MS);
    return () => clearTimeout(swap);
  }, [isFadingOut, points]);

  return (
    <p
      aria-hidden="true"
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={`pointer-events-none absolute bottom-[4cqh] left-[3cqw] text-[27cqh] leading-none font-bold text-white tabular-nums drop-shadow-[0_0.5cqh_1cqh_rgb(0_0_0/0.7)] transition-opacity ${isFadingOut || shown === null ? "opacity-0" : "opacity-100"}`}
    >
      {shown}
    </p>
  );
}
