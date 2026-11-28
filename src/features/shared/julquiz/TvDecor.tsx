import { ChristmasLights } from "./ChristmasLights";
import { treePatternImage, treeTileHeight } from "./treePattern";

// The tile's width in stage units (cqw), so the trees keep their size on any TV.
const TILE_WIDTH = 10;

// A Julquiz TV screen's decorations, behind everything on it (D75): the tree pattern, the lights
// along the top and, on a screen without a box of its own to lie on a bed of pine, pine in the
// lower corners. The pine is a picture made ahead (scripts/buildJulquizImages.mjs), as drawing
// its thousands of needles and snow grains live would slow a TV down. The screen around it must
// be `relative isolate`, so this stays under its content.
export function TvDecor({ corners }: { corners: boolean }) {
  return (
    <div
      aria-hidden
      data-testid="julquiz-decor"
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
      style={{ backgroundImage: treePatternImage, backgroundSize: `${TILE_WIDTH}cqw ${treeTileHeight(TILE_WIDTH)}cqw` }}
    >
      <div className="absolute inset-x-0 top-0">
        <ChristmasLights bulbs={20} />
      </div>
      {corners && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed decoration from public/, which next/image would only resize. */}
          <img src="/julquiz/pine-corner.webp" alt="" className="absolute bottom-0 left-0 w-[13cqw]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- as above, mirrored for the right corner. */}
          <img src="/julquiz/pine-corner.webp" alt="" className="absolute right-0 bottom-0 w-[13cqw] -scale-x-100" />
        </>
      )}
    </div>
  );
}

// A box's bed of pine, reaching out past each of its edges (D75). Put it first inside a box that
// is `relative`, on a Julquiz screen; it draws under the box (`julquiz-pine-bed` in globals.css).
export function PineBed() {
  return <div aria-hidden data-testid="julquiz-pine-bed" className="julquiz-pine-bed" />;
}
