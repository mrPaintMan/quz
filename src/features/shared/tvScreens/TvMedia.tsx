import { Film, Music } from "lucide-react";
import type { Playback } from "@convex/games/playback";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import { TvAudio } from "./TvAudio";
import { TvVideo } from "./TvVideo";

type TvMediaProps = { media: ShownMedia; playback: Playback | null; silent: boolean };

function Still({ url }: { url: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
  return <img src={url} alt="" className="max-h-full max-w-full rounded-[1cqw] object-contain" />;
}

function ClipNote({ kind }: { kind: "audio" | "video" }) {
  const Icon = kind === "audio" ? Music : Film;
  return (
    <p className="flex items-center gap-[1cqw] text-[2.2cqw] text-muted-foreground">
      <Icon aria-hidden="true" className="size-[3cqw]" />
      {kind === "audio" ? "Ljudklipp" : "Videoklipp"}
    </p>
  );
}

// A question's picture, sound or video. `silent` draws it without playing anything, for the
// hosts' small copies of the TV.
export function TvMedia({ media, playback, silent }: TvMediaProps) {
  switch (media.kind) {
    case "image":
      return <Still url={media.url} />;
    case "audio":
      return silent ? <ClipNote kind="audio" /> : <TvAudio url={media.url} playback={playback} />;
    case "video":
      if (silent) return media.posterUrl ? <Still url={media.posterUrl} /> : <ClipNote kind="video" />;
      // Keyed by screen, so the next screen's video never starts with this one's film.
      return (
        <TvVideo
          key={JSON.stringify(media.screen)}
          screen={media.screen}
          posterUrl={media.posterUrl}
          playback={playback}
          showsCluePoints={media.showsCluePoints}
        />
      );
  }
}
