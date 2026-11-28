// The Julquiz background (D75): pointy trees a shade darker than the page, in columns, every other
// column upside down, like a Christmas jumper. One tile of two trees, repeated by CSS; the tile's
// size is set where it is used.
const TREE_COLOUR = "#171219";
const TILE = { width: 96, height: 68 };

// One tree, 46 by 64: three tiers and a trunk.
const tree = (x: number, y: number, flip: boolean) =>
  `<path transform="translate(${x} ${y})${flip ? " rotate(180 23 32)" : ""}" d="M23 0L32.2 19.2H27.6L37.7 37.1H30.4L44.2 55.7H1.8L15.6 37.1H8.3L18.4 19.2H13.8ZM20.2 55.7H25.8V64H20.2Z" fill="${TREE_COLOUR}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE.width}" height="${TILE.height}">${tree(1, 2, false)}${tree(49, 2, true)}</svg>`;

export const treePatternImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

// The tile's height for a given width, keeping its shape.
export function treeTileHeight(width: number): number {
  return (width * TILE.height) / TILE.width;
}
