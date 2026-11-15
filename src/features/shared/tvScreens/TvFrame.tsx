import type { ReactNode } from "react";

// Every TV screen fills the TV stage, with sizes in stage units (`cqw`, see TvStage) so it reads
// from the sofa on any TV. `eyebrow` is the small line above the title, such as the round, and
// `corner` sits on the right, level with the title's first line, such as the timer. `centered` makes the title a large
// heading in the middle, for a round's intro and an activity. `titleCentered` centres the title at
// the top over the content below, for the screens that aren't questions (D66).
type TvFrameProps = { eyebrow?: string; title: string; corner?: ReactNode; centered?: boolean; titleCentered?: boolean; children?: ReactNode };

export function TvFrame({ eyebrow, title, corner, centered = false, titleCentered = false, children }: TvFrameProps) {
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
      <header className={`flex flex-col gap-[0.5cqw] ${titleCentered ? "items-center text-center" : ""}`}>
        {eyebrow && <p className="text-[1.6cqw] text-muted-foreground">{eyebrow}</p>}
        <div className={`flex items-start gap-[3cqw] ${titleCentered ? "justify-center" : "justify-between"}`}>
          <h1 className="text-[5cqw] leading-none font-bold tracking-tight">{title}</h1>
          {corner}
        </div>
      </header>
      {children}
    </div>
  );
}
