import type { ReactNode } from "react";

// Every TV screen fills the TV stage, with sizes in stage units (`cqw`, see TvStage) so it reads
// from the sofa on any TV. `eyebrow` is the small line above the title, such as the round, and
// `corner` sits beside them on the right, such as the timer. `centered` makes the title a large
// heading in the middle, for a round's intro and an activity.
type TvFrameProps = { eyebrow?: string; title: string; corner?: ReactNode; centered?: boolean; children?: ReactNode };

export function TvFrame({ eyebrow, title, corner, centered = false, children }: TvFrameProps) {
  if (centered) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-[3cqw] px-[5cqw] py-[3cqw] text-center">
        {corner && <div className="absolute top-[3cqw] right-[5cqw]">{corner}</div>}
        <header className="flex flex-col items-center gap-[1cqw]">
          {eyebrow && <p className="text-[2.2cqw] text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-[7cqw] leading-tight font-bold tracking-tight text-balance">{title}</h1>
        </header>
        {children}
      </div>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[3cqw] px-[5cqw] py-[3cqw]">
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
