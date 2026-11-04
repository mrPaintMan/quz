import type { MultipleChoiceShown } from "@/domain/questionTypes/multipleChoice/multipleChoiceAnswering";
import { optionLetter } from "@/domain/questionTypes/multipleChoice/optionLetter";
import type { ImageUrls, RevealedDisplayProps, ShownDisplayProps } from "@/features/shared/questionDisplays/QuestionDisplayProps";

type Option = MultipleChoiceShown["options"][number];

// "right" lights the option up on the answer screen, "other" dims the rest; "asked" is neutral.
type OptionLook = "asked" | "right" | "other";

const lookClasses: Record<OptionLook, string> = {
  asked: "border-border bg-card",
  right: "border-primary bg-primary/20",
  other: "border-border bg-card opacity-40",
};

function OptionCard({ option, index, imageUrls, look }: { option: Option; index: number; imageUrls: ImageUrls; look: OptionLook }) {
  const imageUrl = option.imageId === null ? undefined : imageUrls[option.imageId];
  return (
    <li className={`flex min-h-0 items-center gap-[1.6cqw] rounded-[1.4cqw] border-[0.3cqw] px-[2cqw] py-[1.4cqw] ${lookClasses[look]}`}>
      <span className="flex size-[4.4cqw] shrink-0 items-center justify-center rounded-[0.8cqw] bg-secondary text-[2.6cqw] font-bold">
        {optionLetter(index)}
      </span>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- Convex storage URLs are signed and change; next/image would need a remote pattern per deployment.
        <img src={imageUrl} alt="" className="max-h-[14cqw] min-w-0 rounded-[0.8cqw] object-contain" />
      )}
      {option.text && <span className="min-w-0 text-[3cqw] leading-tight font-semibold">{option.text}</span>}
    </li>
  );
}

function OptionGrid({ options, imageUrls, lookOf }: { options: Option[]; imageUrls: ImageUrls; lookOf: (index: number) => OptionLook }) {
  return (
    <ol className="grid shrink-0 grid-cols-2 gap-[1.6cqw]">
      {options.map((option, index) => (
        <OptionCard key={index} option={option} index={index} imageUrls={imageUrls} look={lookOf(index)} />
      ))}
    </ol>
  );
}

// The options A, B, C … while the question is asked.
export function MultipleChoiceQuestion({ shown, imageUrls }: ShownDisplayProps<"multipleChoice">) {
  return <OptionGrid options={shown.options} imageUrls={imageUrls} lookOf={() => "asked"} />;
}

// The same options on the answer screen, with the right one lit up.
export function MultipleChoiceAnswer({ revealed, imageUrls }: RevealedDisplayProps<"multipleChoice">) {
  return <OptionGrid options={revealed.options} imageUrls={imageUrls} lookOf={(index) => (index === revealed.correctIndex ? "right" : "other")} />;
}
