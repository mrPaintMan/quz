import type { Id } from "@convex/_generated/dataModel";
import type { AnsweredType, AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";

// How one question type is answered in the app (D14). `Shown` is what the TV and the phones may
// know while the question is asked, never its answer key; `Revealed` is what the answer screen
// shows.
export type AnsweringRules<T extends AnsweredType, Shown, Revealed> = {
  show: (content: ContentOf<T>) => Shown;
  reveal: (content: ContentOf<T>) => Revealed;
  // Pictures the question shows, such as image options, so the server can link them.
  imageIds: (content: ContentOf<T>) => Id<"_storage">[];
  // Whether an answer is filled in enough to be sent, judged against what the question shows, so
  // the phone and the server agree.
  isComplete: (shown: Shown, answer: AnswerOf<T>) => boolean;
  // The points each of the question's locked answers scores, as graded automatically, in the
  // order given. All answers come together, as some types rank the teams against each other.
  grade: (content: ContentOf<T>, answers: AnswerOf<T>[]) => number[];
};
