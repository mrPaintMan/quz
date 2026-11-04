import { optionLetter } from "@/domain/questionTypes/multipleChoice/optionLetter";
import type { AnswerInputProps } from "@/features/player/answering/AnswerInputProps";

// One big button per option; tapping one picks it, tapping another changes the pick.
export function MultipleChoiceInput({ shown, answer, imageUrls, disabled, onChange }: AnswerInputProps<"multipleChoice">) {
  return (
    <fieldset className="flex flex-col gap-2.5" disabled={disabled}>
      <legend className="mb-1 text-sm text-muted-foreground">Välj ett alternativ</legend>
      {shown.options.map((option, index) => {
        const isPicked = answer?.optionIndex === index;
        const imageUrl = option.imageId === null ? undefined : imageUrls[option.imageId];
        return (
          <button
            key={index}
            type="button"
            aria-pressed={isPicked}
            // The letter and the text sit in separate boxes; named together they read "B Norge".
            aria-label={[optionLetter(index), option.text].filter(Boolean).join(" ")}
            onClick={() => onChange({ type: "multipleChoice", optionIndex: index })}
            className={`flex min-h-15 items-center gap-3.5 rounded-2xl px-4 py-2 text-left text-lg disabled:opacity-60 ${isPicked ? "border-2 border-primary bg-secondary" : "border bg-card"}`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-semibold ${isPicked ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {optionLetter(index)}
            </span>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
              <img src={imageUrl} alt="" className="max-h-24 min-w-0 rounded-md object-contain" />
            )}
            {option.text}
          </button>
        );
      })}
    </fieldset>
  );
}
