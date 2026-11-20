// Rebuilds the map files in src/features/shared/map/data (D69). Run by hand when the sources
// change: `node scripts/buildMapData.mjs`. The output is checked in, so the app never runs this.
//
// - countries-10m-light.json: Natural Earth's 1:10m countries (world-atlas, public domain) with a
//   quarter of the points, for zoom 6 and up. The full file is about 1 MB compressed and freezes
//   a phone for up to a second; this one is about a third of that and draws about 4× faster.
// - regions.json: only the lines between Sweden's landskap and between the US states, drawn
//   thinner from zoom 4. Landskap: perliedman/svenska-landskap, from Lantmäteriet's
//   Distriktskarta (CC0). States: us-atlas, from the US Census Bureau (public domain).
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Fetched by npx when run, so the app's installs don't carry it.
const mapshaper = { runCommands: (commands) => execFileSync("npx", ["--yes", "mapshaper@0.8.6", ...commands.split(" ")], { stdio: "inherit" }) };

const out = new URL("../src/features/shared/map/data/", import.meta.url);
const landskapUrl =
  "https://raw.githubusercontent.com/perliedman/svenska-landskap/64f033ea4cab359d6810e27b221ca6b7f10ce649/svenska-landskap.geo.json";

const work = await mkdtemp(join(tmpdir(), "quz-map-"));
const download = async (url, name) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const path = join(work, name);
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  return path;
};

try {
  const countries = new URL("../node_modules/world-atlas/countries-10m.json", import.meta.url).pathname;
  mapshaper.runCommands(
    `-i ${countries} -target countries -drop fields=* -simplify 25% keep-shapes ` +
      `-o ${join(out.pathname, "countries-10m-light.json")} format=topojson quantization=100000`,
  );

  const landskap = await download(landskapUrl, "landskap.geo.json");
  const states = new URL("../node_modules/us-atlas/states-10m.json", import.meta.url).pathname;
  // The landskap were simplified one by one, so neighbours don't quite meet: snap them together
  // first, or there would be no shared lines to keep.
  mapshaper.runCommands(
    `-i ${landskap} snap snap-interval=0.0005 -clean -simplify 10% keep-shapes -innerlines -o ${join(work, "landskap.json")} format=geojson`,
  );
  mapshaper.runCommands(
    `-i ${states} -target states -innerlines -o ${join(work, "states.geojson")} format=geojson`,
  );
  mapshaper.runCommands(
    `-i ${join(work, "landskap.json")} ${join(work, "states.geojson")} combine-files -merge-layers force name=regions ` +
      `-o ${join(out.pathname, "regions.json")} format=topojson quantization=100000`,
  );
  for (const name of ["countries-10m-light.json", "regions.json"]) {
    const size = (await readFile(new URL(name, out))).length;
    console.log(`${name}: ${Math.round(size / 1000)} kB`);
  }
} finally {
  await rm(work, { recursive: true, force: true });
}
