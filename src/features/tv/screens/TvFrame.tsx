import type { ReactNode } from "react";

// Every TV screen fills the screen, with sizes in viewport units so it reads from the sofa on
// any TV. `eyebrow` is the small line above the title, such as the round.
export function TvFrame({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col gap-[3vw] px-[5vw] py-[4vw]">
      <header className="flex flex-col gap-[0.5vw]">
        {eyebrow && <p className="text-[1.6vw] text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-[5vw] leading-none font-bold tracking-tight">{title}</h1>
      </header>
      {children}
    </main>
  );
}
