"use client";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { QuestionMedia } from "@convex/questions/table";
import { Button } from "@/components/ui/button";
import { rulesFor } from "@/domain/questionTypes/registry";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { FileButton } from "./FileButton";
import { mediaKindOf } from "./mediaKindOf";
import { MediaPreview } from "./MediaPreview";
import { readVideoFacts } from "./readVideoFacts";
import { useUploadFile } from "./useUploadFile";
import { useUploadFilm } from "./useUploadFilm";
import { VideoPreview } from "./VideoPreview";

// Image, audio or a video shown with the question. A question that needs a film, the
// På spåret trip, takes only video (D30).
export function QuestionMediaField({ question }: { question: Doc<"questions"> }) {
  const uploadFile = useUploadFile();
  const uploadFilm = useUploadFilm();
  const setMedia = useHostMutation(api.media.mutations.setQuestionMedia);
  const removeMedia = useHostMutation(api.media.mutations.removeQuestionMedia);
  const run = useRunAction();
  const needsFilm = rulesFor(question.content).requiresVideo;

  async function toMedia(file: File): Promise<QuestionMedia> {
    const kind = mediaKindOf(file.type);
    if (kind === null || (needsFilm && kind !== "video")) {
      throw new Error(needsFilm ? "Bara video." : "Bara bild, ljud eller video.");
    }
    if (kind !== "video") {
      return { kind, storageId: await uploadFile(file) };
    }
    const { still, durationSeconds } = await readVideoFacts(file);
    // A still that fails to upload is left out rather than failing the film's upload with it.
    const stillUpload = still ? uploadFile(still).catch(() => null) : null;
    const [r2Key, posterId] = await Promise.all([uploadFilm(file), stillUpload]);
    return { kind, r2Key, posterId, durationSeconds };
  }

  async function upload(file: File) {
    await setMedia({ questionId: question._id, media: await toMedia(file) });
  }

  const { media } = question;
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <h3 className="text-sm font-medium">{needsFilm ? "Filmen" : "Bild, ljud eller video"}</h3>
      {needsFilm && (
        <p className="text-sm text-muted-foreground">
          Exportera som MP4 i 1080p, 30 bilder per sekund, runt 5 Mbit/s (cirka 75 MB för 2 minuter), så att den laddas
          snabbt på TV:n.
        </p>
      )}
      {media?.kind === "video" && <VideoPreview media={media} alt={needsFilm ? "Filmen" : "Frågans video"} />}
      {media && media.kind !== "video" && <MediaPreview storageId={media.storageId} kind={media.kind} alt="Frågans media" />}
      <div className="flex flex-wrap gap-2">
        <FileButton accept={needsFilm ? "video/*" : "image/*,audio/*,video/*"} onFile={upload}>
          {media ? "Byt fil" : needsFilm ? "Lägg till filmen" : "Lägg till fil"}
        </FileButton>
        {media && (
          <Button variant="ghost" onClick={() => run(() => removeMedia({ questionId: question._id }))}>
            Ta bort fil
          </Button>
        )}
      </div>
    </section>
  );
}
