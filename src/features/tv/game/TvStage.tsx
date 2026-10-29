import type { ReactNode } from "react";

// The TV is a browser window of any shape, so every screen is drawn on a 16:9 stage, as large as
// fits the window both ways and centred. Screens size everything in `cqw` (hundredths of the
// stage's width), so a screen looks the same at any window size and never spills out of it.
export function TvStage({ children }: { children: ReactNode }) {
  return (
    <main className="grid h-svh place-items-center overflow-hidden">
      <div data-testid="tv-stage" className="@container flex aspect-video w-[min(100vw,100svh*16/9)] flex-col overflow-hidden">
        {children}
      </div>
    </main>
  );
}
