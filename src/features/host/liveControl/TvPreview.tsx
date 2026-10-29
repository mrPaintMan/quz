import type { ReactNode } from "react";

// A small copy of the TV: TV screens size everything in stage units (`cqw`), so they shrink to
// any box of the TV's shape. Hidden from screen readers, since the label under each preview says
// what it shows, and the screens' headings would compete with the page's own.
export function TvPreview({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" className="@container flex aspect-video w-full flex-col overflow-hidden rounded-xl border-2 bg-background">
      {children}
    </div>
  );
}
