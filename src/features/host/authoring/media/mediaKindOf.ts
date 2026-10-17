export type MediaKind = "image" | "audio" | "video";

// Which kind of question media a file is, from its MIME type; null if unsupported.
export function mediaKindOf(mimeType: string): MediaKind | null {
  const [category] = mimeType.split("/");
  return category === "image" || category === "audio" || category === "video" ? category : null;
}
