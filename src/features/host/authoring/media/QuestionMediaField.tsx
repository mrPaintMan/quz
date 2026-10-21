"use client";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { rulesFor } from "@/domain/questionTypes/registry";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { FileButton } from "./FileButton";
import { FilmField } from "./FilmField";
import { mediaKindOf } from "./mediaKindOf";
import { MediaPreview } from "./MediaPreview";
import { useUploadFile } from "./useUploadFile";
import { useUploadVideo } from "./useUploadVideo";
import { VideoPreview } from "./VideoPreview";

// Image, audio or a video shown with the question. A question that needs a film, the
// På spåret trip, takes only video (D30).
export function QuestionMediaField({ question }: { question: Doc<"questions"> }) {
  const uploadFile = useUploadFile();
  const uploadVideo = useUploadVideo();
  const setMedia = useHostMutation(api.media.mutations.setQuestionMedia);
  const removeMedia = useHostMutation(api.media.mutations.removeQuestionMedia);
  const run = useRunAction();
  const { media } = question;

  if (rulesFor(question.content).requiresVideo) {
    return (
      <FilmField
        title="Filmen"
        video={media?.kind === "video" ? media : null}
        onChange={(video) => (video ? setMedia({ questionId: question._id, media: video }) : removeMedia({ questionId: question._id }))}
      />
    );
  }

  async function upload(file: File) {
    const kind = mediaKindOf(file.type);
    if (kind === null) {
      throw new Error("Bara bild, ljud eller video.");
    }
    const uploaded = kind === "video" ? await uploadVideo(file) : { kind, storageId: await uploadFile(file) };
    await setMedia({ questionId: question._id, media: uploaded });
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <h3 className="text-sm font-medium">Bild, ljud eller video</h3>
      {media?.kind === "video" && <VideoPreview media={media} alt="Frågans video" />}
      {media && media.kind !== "video" && <MediaPreview storageId={media.storageId} kind={media.kind} alt="Frågans media" />}
      <div className="flex flex-wrap gap-2">
        <FileButton accept="image/*,audio/*,video/*" onFile={upload}>
          {media ? "Byt fil" : "Lägg till fil"}
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
