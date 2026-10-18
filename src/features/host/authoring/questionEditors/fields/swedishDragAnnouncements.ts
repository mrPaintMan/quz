import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";

export const swedishDragInstructions: ScreenReaderInstructions = {
  draggable:
    "Tryck mellanslag eller Enter för att lyfta. Flytta med piltangenterna. Släpp med mellanslag eller Enter, avbryt med Escape.",
};

// What screen readers hear while a row is dragged; dnd-kit's own texts are in English.
export function swedishDragAnnouncements(nameOf: (id: string) => string, placeOf: (id: string) => number): Announcements {
  const name = (id: string | number) => nameOf(String(id));
  const place = (id: string | number) => placeOf(String(id));
  return {
    onDragStart: ({ active }) => `Lyfte ${name(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${name(active.id)} är över plats ${place(over.id)}.` : `${name(active.id)} är utanför listan.`,
    onDragEnd: ({ active, over }) =>
      over ? `${name(active.id)} släpptes på plats ${place(over.id)}.` : `${name(active.id)} släpptes utanför listan.`,
    onDragCancel: ({ active }) => `Flytten avbröts, ${name(active.id)} ligger kvar.`,
  };
}
