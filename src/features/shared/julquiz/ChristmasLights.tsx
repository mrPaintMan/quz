// A string of coloured bulbs hanging in loops along the top of a screen (D75). Each bulb glows and
// dims slowly on its own beat (`julquiz-bulb` in globals.css). Drawn in code rather than as an
// image, as it is only a few shapes and stays sharp at any size; the glow is a soft gradient
// rather than a blur, which would be costly to redraw while the bulbs dim.
const COLOURS = ["#e8524a", "#e8b04b", "#6fb08a", "#8fa8d9", "#c58fd1"];
const SPACING = 60;
const HEIGHT = 60;
const SAG = 22;
const BULBS_PER_LOOP = 4;
// The twinkle lasts 9 s; bulbs start at different points of it so they never dim together.
const BEAT_SECONDS = 9;

// A point on the loop's curve, t from 0 to 1, for a loop from x0 to x1.
function onLoop(x0: number, x1: number, t: number) {
  const middle = (x0 + x1) / 2;
  return { x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * middle + t * t * x1, y: 2 * (1 - t) * t * SAG };
}

export function ChristmasLights({ bulbs }: { bulbs: number }) {
  const loops = Math.max(1, Math.round(bulbs / BULBS_PER_LOOP));
  const width = bulbs * SPACING;
  const loopWidth = width / loops;
  const perLoop = bulbs / loops;
  return (
    <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="block w-full" aria-hidden>
      <defs>
        {COLOURS.map((colour, index) => (
          <radialGradient key={colour} id={`julquiz-glow-${index}`}>
            <stop offset="0" stopColor={colour} stopOpacity="0.55" />
            <stop offset="1" stopColor={colour} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {Array.from({ length: loops }, (_, loop) => {
        const x0 = loop * loopWidth;
        const x1 = x0 + loopWidth;
        return <path key={loop} d={`M${x0} 0Q${(x0 + x1) / 2} ${SAG * 2} ${x1} 0`} fill="none" stroke="#2a222d" strokeWidth="2.5" />;
      })}
      {Array.from({ length: bulbs }, (_, index) => {
        const loop = Math.floor(index / perLoop);
        const { x, y } = onLoop(loop * loopWidth, (loop + 1) * loopWidth, (index - loop * perLoop + 0.5) / perLoop);
        const colourIndex = index % COLOURS.length;
        // A spread of starting points that doesn't repeat along the string.
        const delay = -((index * 3.7) % BEAT_SECONDS);
        return (
          <g key={index} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <rect x="-3.5" y="0" width="7" height="6" rx="1.5" fill="#3b3340" />
            <g className="julquiz-bulb" style={{ animationDelay: `${delay.toFixed(1)}s` }}>
              <circle cy="15" r="20" fill={`url(#julquiz-glow-${colourIndex})`} />
              <ellipse cy="15" rx="7" ry="11" fill={COLOURS[colourIndex]} />
              <ellipse cx="-2" cy="11" rx="2" ry="4" fill="#fff" opacity="0.45" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
