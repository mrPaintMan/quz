"use client";

import type { VideoMedia } from "@convex/questions/table";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { FileButton } from "./FileButton";
import { useUploadVideo } from "./useUploadVideo";
import { VideoPreview } from "./VideoPreview";

type FilmFieldProps = {
  title: string;
  video: VideoMedia | null;
  onChange: (video: VideoMedia | null) => Promise<unknown>;
};

// A required film, such as the trip's or one the round's questions are asked after (D30, D32).
export function FilmField({ title, video, onChange }: FilmFieldProps) {
  const uploadVideo = useUploadVideo();
  const run = useRunAction();
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">
        Exportera som MP4 i 1080p, 30 bilder per sekund, runt 5 Mbit/s (cirka 75 MB för 2 minuter), så att den laddas
        snabbt på TV:n.
      </p>
      {video && <VideoPreview media={video} alt={title} />}
      <div className="flex flex-wrap gap-2">
        <FileButton
          accept="video/*"
          onFile={async (file) => {
            if (!file.type.startsWith("video/")) throw new Error("Bara video.");
            await onChange(await uploadVideo(file));
          }}
        >
          {video ? "Byt film" : "Ladda upp film"}
        </FileButton>
        {video && (
          <Button variant="ghost" onClick={() => run(() => onChange(null))}>
            Ta bort film
          </Button>
        )}
      </div>
    </section>
  );
}
