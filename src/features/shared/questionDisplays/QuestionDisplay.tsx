import type { ComponentType, ReactNode } from "react";
import type { RevealedAnswer, ShownQuestion } from "@/domain/answering/registry";
import type { ImageUrls } from "./QuestionDisplayProps";
import { questionDisplays } from "./registry";

type AnyDisplay = {
  Question: ComponentType<{ shown: ShownQuestion; imageUrls: ImageUrls }>;
  Answer: ComponentType<{ revealed: RevealedAnswer; imageUrls: ImageUrls; media?: ReactNode }>;
  placesMedia?: boolean;
};

// The registry pairs each type with its own display; TypeScript can't follow the lookup.
const displayOf = (type: ShownQuestion["type"]) => questionDisplays[type] as unknown as AnyDisplay | null;

// The question's own part of the TV screen, such as the options, from its type's display.
export function ShownQuestionDisplay({ shown, imageUrls }: { shown: ShownQuestion; imageUrls: ImageUrls }) {
  const display = displayOf(shown.type);
  return display && <display.Question shown={shown} imageUrls={imageUrls} />;
}

// Whether a type's answer screen places the question's picture itself (D66).
export const answerPlacesMedia = (type: RevealedAnswer["type"]) => displayOf(type)?.placesMedia === true;

// The answer's part of the answer screen, such as the options with the right one lit up; media is
// the question's picture, for a type that places it itself.
export function RevealedAnswerDisplay({ revealed, imageUrls, media }: { revealed: RevealedAnswer; imageUrls: ImageUrls; media?: ReactNode }) {
  const display = displayOf(revealed.type);
  return display && <display.Answer revealed={revealed} imageUrls={imageUrls} media={media} />;
}
