import { QRCodeSVG } from "qrcode.react";
import { TeamList, type TvTeam } from "./TeamList";
import { TvFrame } from "./TvFrame";

type LobbyScreenProps = { quizTitle: string; joinUrl: URL; teams: TvTeam[] };

// Phones join by scanning the code, or by typing the address under it (D34).
export function LobbyScreen({ quizTitle, joinUrl, teams }: LobbyScreenProps) {
  return (
    <TvFrame eyebrow="Välkomna till" title={quizTitle}>
      <div className="flex flex-1 gap-[4cqw]">
        <section className="flex w-[32cqw] shrink-0 flex-col items-center gap-[1.6cqw] rounded-[1.6cqw] border-2 bg-card p-[2.4cqw]">
          <h2 className="text-[2.2cqw] font-semibold">Skanna för att gå med</h2>
          <div className="rounded-[1.2cqw] bg-foreground p-[1.4cqw]">
            <QRCodeSVG value={joinUrl.href} title={`QR-kod till ${joinUrl.host}`} bgColor="transparent" fgColor="var(--background)" className="size-[16cqw]" />
          </div>
          <p className="text-[1.6cqw] text-muted-foreground">eller gå till</p>
          <p className="text-[2.4cqw] font-semibold text-primary">{joinUrl.host}</p>
        </section>
        <section className="flex min-w-0 flex-1 flex-col gap-[1.6cqw]">
          <h2 className="text-[2.6cqw] font-semibold">Anmälda lag</h2>
          <TeamList teams={teams} emptyText="Väntar på första laget…" />
        </section>
      </div>
    </TvFrame>
  );
}
