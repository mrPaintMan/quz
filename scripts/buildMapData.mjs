// Rebuilds the map files in src/features/shared/map/data (D69). Run by hand when the sources
// change: `node scripts/buildMapData.mjs`. The output is checked in, so the app never runs this.
//
// - countries-10m-light.json: Natural Earth's 1:10m countries (world-atlas, public domain) with a
//   quarter of the points, for zoom 6 and up. The full file is about 1 MB compressed and freezes
//   a phone for up to a second; this one is about a third of that and draws about 4× faster.
//   Douglas–Peucker keeps islands down to a few km², where the default method dropped a third
//   of them.
// - regions.json: only the lines between Sweden's landskap and between the US states, drawn
//   thinner from zoom 4. Landskap: perliedman/svenska-landskap, from Lantmäteriet's
//   Distriktskarta (CC0). States: us-atlas, from the US Census Bureau (public domain).
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const out = fromRoot("src/features/shared/map/data");
const landskapUrl =
  "https://raw.githubusercontent.com/perliedman/svenska-landskap/64f033ea4cab359d6810e27b221ca6b7f10ce649/svenska-landskap.geo.json";

// Fetched by npx when run, so the app's installs don't carry it.
const mapshaper = (...args) => execFileSync("npx", ["--yes", "mapshaper@0.8.6", ...args], { stdio: "inherit", shell: process.platform === "win32" });

const work = await mkdtemp(join(tmpdir(), "quz-map-"));
try {
  mapshaper(
    "-i", fromRoot("node_modules/world-atlas/countries-10m.json"),
    "-target", "countries", "-drop", "fields=*", "-simplify", "dp", "25%", "keep-shapes",
    "-o", join(out, "countries-10m-light.json"), "format=topojson", "quantization=100000",
  );

  const response = await fetch(landskapUrl);
  if (!response.ok) throw new Error(`${landskapUrl}: ${response.status}`);
  const landskap = join(work, "landskap.geo.json");
  await writeFile(landskap, Buffer.from(await response.arrayBuffer()));
  // The landskap were simplified one by one, so neighbours don't quite meet: snap them together
  // first, or there would be no shared lines to keep.
  mapshaper(
    "-i", landskap, "snap", "snap-interval=0.0005", "-clean", "-simplify", "10%", "keep-shapes", "-innerlines",
    "-o", join(work, "landskap.json"), "format=geojson",
  );
  mapshaper(
    "-i", fromRoot("node_modules/us-atlas/states-10m.json"), "-target", "states", "-innerlines",
    "-o", join(work, "states.json"), "format=geojson",
  );
  mapshaper(
    "-i", join(work, "landskap.json"), join(work, "states.json"), "combine-files", "-merge-layers", "force", "name=regions",
    "-o", join(out, "regions.json"), "format=topojson", "quantization=100000",
  );
  for (const name of ["countries-10m-light.json", "regions.json"]) {
    const size = (await readFile(join(out, name))).length;
    console.log(`${name}: ${Math.round(size / 1000)} kB`);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
