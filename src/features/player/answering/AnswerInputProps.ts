import type { AnsweredType, AnswerOf } from "@convex/answers/answerContent";
import type { Playback } from "@convex/games/playback";
import type { ShownQuestion } from "@/domain/answering/registry";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// The film the question plays, where it is and how long it is, for a trip's live points (D63).
export type FilmOnScreen = { playback: Playback | null; durationSeconds: number | null };

// What every type's answer input gets: the question as shown, the team's answer so far (null
// before the first change), and whether it may still change. A type sent by the emergency brake
// sends its answer itself (onSend), as the brake is part of its input, and gets the trip's film.
export type AnswerInputProps<T extends AnsweredType> = {
  shown: Extract<ShownQuestion, { type: T }>;
  answer: AnswerOf<T> | null;
  imageUrls: ImageUrls;
  disabled: boolean;
  onChange: (answer: AnswerOf<T>) => void;
  onSend?: (answer: AnswerOf<T>) => void;
  isSending?: boolean;
  film?: FilmOnScreen | null;
};
