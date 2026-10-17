"use client";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { FileButton } from "./FileButton";
import { mediaKindOf } from "./mediaKindOf";
import { MediaPreview } from "./MediaPreview";
import { useUploadFile } from "./useUploadFile";

// Image, audio or a short video clip shown with the question; long films go as links (D5).
export function QuestionMediaField({ question }: { question: Doc<"questions"> }) {
  const uploadFile = useUploadFile();
  const setMedia = useHostMutation(api.media.mutations.setQuestionMedia);
  const removeMedia = useHostMutation(api.media.mutations.removeQuestionMedia);
  const run = useRunAction();

  async function upload(file: File) {
    const kind = mediaKindOf(file.type);
    if (kind === null) {
      throw new Error("Bara bild, ljud eller video.");
    }
    await setMedia({ questionId: question._id, kind, storageId: await uploadFile(file) });
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
      <h3 className="text-sm font-medium">Bild, ljud eller videoklipp</h3>
      {question.media && (
        <MediaPreview storageId={question.media.storageId} kind={question.media.kind} alt="Frågans media" />
      )}
      <div className="flex flex-wrap gap-2">
        <FileButton accept="image/*,audio/*,video/*" onFile={upload}>
          {question.media ? "Byt fil" : "Lägg till fil"}
        </FileButton>
        {question.media && (
          <Button variant="ghost" onClick={() => run(() => removeMedia({ questionId: question._id }))}>
            Ta bort fil
          </Button>
        )}
      </div>
    </section>
  );
}
