// Rebuilds the Julquiz decorations in public/julquiz (D75): the pine bed that boxes lie on, and the
// pine cluster for the lower corners of a screen, both with snow. Run by hand when the look
// changes: `node scripts/buildJulquizImages.mjs`. The images are checked in, so the app never runs
// this. They are drawn as SVG (thousands of needles and snow grains, far too many to draw live on
// a phone) and saved as WebP with sharp, which comes with Next.js.
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const out = fileURLToPath(new URL("../public/julquiz/", import.meta.url));
const greens = ["#14291a", "#183220", "#1c3a25", "#20412a", "#173020"];
const snow = "#eef2f6";

// A seeded random source, so a rebuild gives the same picture.
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
const between = (next, low, high) => low + next() * (high - low);
const pick = (next, list) => list[Math.floor(next() * list.length)];
const fixed = (value) => value.toFixed(1);

// One sprig: a twig with soft, round-ended needles, and fine snow on its upper side when it points up.
function sprig(next, x, y, length, degrees) {
  const angle = (degrees * Math.PI) / 180;
  const endX = x + length * Math.cos(angle);
  const endY = y + length * Math.sin(angle);
  const colour = pick(next, greens);
  let svg = `<line x1="${fixed(x)}" y1="${fixed(y)}" x2="${fixed(endX)}" y2="${fixed(endY)}" stroke="#2e2218" stroke-width="2.2" stroke-linecap="round"/>`;
  const steps = Math.floor(length / 2.6);
  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    const px = x + (endX - x) * t;
    const py = y + (endY - y) * t;
    const needle = 7.5 * (1 - t * 0.5);
    for (const side of [-1, 1]) {
      const needleAngle = angle + (side * 55 * Math.PI) / 180;
      svg += `<line x1="${fixed(px)}" y1="${fixed(py)}" x2="${fixed(px + needle * Math.cos(needleAngle))}" y2="${fixed(py + needle * Math.sin(needleAngle))}" stroke="${colour}" stroke-width="3.2" stroke-linecap="round"/>`;
    }
  }
  if (Math.sin(angle) < -0.15) {
    const grains = Math.floor(length * 0.5);
    for (let grain = 0; grain < grains; grain++) {
      const t = between(next, 0.2, 1) ** 0.6;
      const spread = 7 * (1 - t * 0.4);
      const gx = x + (endX - x) * t + between(next, -spread, spread);
      const gy = y + (endY - y) * t - between(next, 1, 5);
      svg += `<circle cx="${fixed(gx)}" cy="${fixed(gy)}" r="${fixed(between(next, 0.8, 2.1))}" fill="${snow}" opacity="${between(next, 0.75, 1).toFixed(2)}"/>`;
    }
  }
  return svg;
}

// The bed: sprigs reaching out from every edge of a box, shorter along the top so they keep clear
// of a title above. The box sits `margin` in from each side; its inside stays empty, as the box
// covers it.
function bed({ width, height, margin, radius, seed }) {
  const next = random(seed);
  const [left, top, right, bottom] = [margin, margin, width - margin, height - margin];
  const middle = [width / 2, height / 2];
  const points = [];
  for (let x = left + radius; x < right - radius; x += 9) points.push([x, bottom, 1, 0], [x, top, 1, 0]);
  for (let y = top + radius; y < bottom - radius; y += 9) points.push([left, y, 0, 1], [right, y, 0, 1]);
  for (const [cx, cy, from] of [[left + radius, top + radius, 180], [right - radius, top + radius, 270], [right - radius, bottom - radius, 0], [left + radius, bottom - radius, 90]]) {
    for (let k = 0; k < 5; k++) {
      const theta = ((from + (90 * k) / 5) * Math.PI) / 180;
      points.push([cx + radius * Math.cos(theta), cy + radius * Math.sin(theta), -Math.sin(theta), Math.cos(theta)]);
    }
  }
  // Shuffled so no edge is drawn wholly over another; Fisher–Yates, so a rebuild is the same.
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }
  let svg = "";
  for (const [px, py, tx, ty] of points) {
    let [nx, ny] = [ty, -tx];
    if (nx * (px - middle[0]) + ny * (py - middle[1]) < 0) [nx, ny] = [-nx, -ny];
    const onTop = py <= top + 1;
    for (let twice = 0; twice < 2; twice++) {
      const fan = (between(next, -70, 70) * Math.PI) / 180;
      const dx = nx * Math.cos(fan) + tx * Math.sin(fan);
      const dy = ny * Math.cos(fan) + ty * Math.sin(fan);
      const length = onTop ? between(next, 18, 26) : between(next, 26, 40);
      svg += sprig(next, px - nx * 8, py - ny * 8, length, (Math.atan2(dy, dx) * 180) / Math.PI);
    }
  }
  return svg;
}

// A cluster growing up and in from the lower-left corner; the right corner shows it mirrored.
function corner({ size, seed }) {
  const next = random(seed);
  const sprigs = [];
  for (let n = 0; n < 46; n++) {
    const base = next() ** 1.6;
    sprigs.push([base * 230, size - between(next, 0, 20), between(next, 70, 150) * (1 - base * 0.6), -between(next, 15, 80)]);
  }
  for (let n = 0; n < 22; n++) {
    const up = next() ** 1.4;
    sprigs.push([0, size - up * 230, between(next, 60, 130) * (1 - up * 0.6), -between(next, -5, 45)]);
  }
  sprigs.sort((a, b) => b[2] - a[2]);
  return sprigs.map(([x, y, length, angle]) => sprig(next, x - 6, y + 6, length, angle)).join("");
}

async function save(name, width, height, body, scale) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 82, alphaQuality: 90 }).toFile(`${out}${name}`);
  console.log(`${name}: ${width * scale}×${height * scale}`);
}

await mkdir(out, { recursive: true });
// Units are a 960-wide TV, drawn twice as large; the CSS slices the bed at its margin plus a corner.
await save("pine-bed.webp", 600, 440, bed({ width: 600, height: 440, margin: 70, radius: 18, seed: 11 }), 2);
await save("pine-corner.webp", 260, 260, corner({ size: 260, seed: 3 }), 2);
