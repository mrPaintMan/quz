import type { ReactNode } from "react";
import type { AnsweredType } from "@convex/answers/answerContent";
import type { RevealedAnswer, ShownQuestion } from "@/domain/answering/registry";

// Links to the question's own pictures by their file (showScreen).
export type ImageUrls = Record<string, string>;

export type ShownDisplayProps<T extends AnsweredType> = { shown: Extract<ShownQuestion, { type: T }>; imageUrls: ImageUrls };
// media is the question's picture or still, for a display that places it itself (placesMedia, D66).
export type RevealedDisplayProps<T extends AnsweredType> = { revealed: Extract<RevealedAnswer, { type: T }>; imageUrls: ImageUrls; media?: ReactNode };
