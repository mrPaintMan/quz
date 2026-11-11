// Photos straight from a phone are often several megabytes and took the TV seconds to show (D57).
const MAX_SIDE = 1920;
const QUALITY = 0.85;

// Formats that would lose something when redrawn: an animated GIF its motion, an SVG its sharpness.
const KEPT_AS_IS = new Set(["image/gif", "image/svg+xml"]);

const encode = (canvas: HTMLCanvasElement, type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

// An image redrawn at most 1920 pixels on its longer side, as WebP (JPEG where the browser can't
// write WebP, unless it may be transparent), turned the right way up. Anything else, or an image
// the browser can't redraw, is kept as it is, as is one the redrawing wouldn't make smaller.
export async function shrinkImage(file: Blob): Promise<Blob> {
  if (!file.type.startsWith("image/") || KEPT_AS_IS.has(file.type) || typeof createImageBitmap === "undefined") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (context === null) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // A browser that can't write WebP gives a PNG instead.
  const webp = await encode(canvas, "image/webp");
  const shrunk = webp?.type === "image/webp" ? webp : file.type === "image/png" ? null : await encode(canvas, "image/jpeg");
  return shrunk !== null && shrunk.size < file.size ? shrunk : file;
}
