import type { ReactNode } from "react";

// Every TV screen fills the TV stage, with sizes in stage units (`cqw`, see TvStage) so it reads
// from the sofa on any TV. `eyebrow` is the small line above the title, such as the round, and
// `corner` sits beside them on the right, such as the timer.
type TvFrameProps = { eyebrow?: string; title: string; corner?: ReactNode; children?: ReactNode };

export function TvFrame({ eyebrow, title, corner, children }: TvFrameProps) {
  return (
    <div className="flex flex-1 flex-col gap-[3cqw] px-[5cqw] py-[3cqw]">
      <header className="flex items-start justify-between gap-[3cqw]">
        <div className="flex flex-col gap-[0.5cqw]">
          {eyebrow && <p className="text-[1.6cqw] text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-[5cqw] leading-none font-bold tracking-tight">{title}</h1>
        </div>
        {corner}
      </header>
      {children}
    </div>
  );
}
