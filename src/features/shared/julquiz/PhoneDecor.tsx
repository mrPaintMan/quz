import { ChristmasLights } from "./ChristmasLights";
import { treePatternImage, treeTileHeight } from "./treePattern";

const TILE_WIDTH = 68;

// A Julquiz phone's decorations, fixed behind the page (D75): the tree pattern, a shorter string of
// lights along the top and small pine in the lower corners. They stay put while the page scrolls.
export function PhoneDecor() {
  return (
    <div
      aria-hidden
      data-testid="julquiz-decor"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundImage: treePatternImage, backgroundSize: `${TILE_WIDTH}px ${treeTileHeight(TILE_WIDTH)}px` }}
    >
      <div className="absolute inset-x-0 top-0">
        <ChristmasLights bulbs={8} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed decoration from public/, which next/image would only resize. */}
      <img src="/julquiz/pine-corner.webp" alt="" className="absolute bottom-0 left-0 w-[88px]" />
      {/* eslint-disable-next-line @next/next/no-img-element -- as above, mirrored for the right corner. */}
      <img src="/julquiz/pine-corner.webp" alt="" className="absolute right-0 bottom-0 w-[88px] -scale-x-100" />
    </div>
  );
}
