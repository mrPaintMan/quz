import type { Id } from "@convex/_generated/dataModel";
import type { AnsweredType, AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";
import type { TypedReview, Verdict } from "@/domain/review/typedReview";

// A closed question's sent answers that fit it, with the verdicts on their texts.
export type Graded<Answer> = { answers: Answer[]; verdicts: Verdict[] };

// How one question type is answered in the app (D14). `Shown` is what the TV and the phones may
// know while the question is asked, never its answer key; `Revealed` is what the answer screen
// shows.
export type AnsweringRules<T extends AnsweredType, Shown, Revealed> = {
  show: (content: ContentOf<T>) => Shown;
  // graded holds the question's sent answers and verdicts, for a type that reveals what the teams
  // got right (revealsAnswers); the others reveal from the question alone.
  reveal: (content: ContentOf<T>, graded?: Graded<AnswerOf<T>>) => Revealed;
  revealsAnswers?: boolean;
  // Pictures the question shows, such as image options, so the server can link them.
  imageIds: (content: ContentOf<T>) => Id<"_storage">[];
  // What the team's answer is before it changes anything; null for most types, where nothing is
  // picked yet. Not saved as a draft until the team changes it.
  startingAnswer: (shown: Shown) => AnswerOf<T> | null;
  // Whether an answer is filled in enough to be sent, judged against what the question shows, so
  // the phone and the server agree.
  isComplete: (shown: Shown, answer: AnswerOf<T>) => boolean;
  // The points each of the question's locked answers scores, as graded automatically, in the
  // order given. All answers come together, as some types rank the teams against each other.
  // Types with typed answers also count the hosts' verdicts (D51); the others ignore them.
  grade: (content: ContentOf<T>, answers: AnswerOf<T>[], verdicts?: Verdict[]) => number[];
  // For typed answers only: the slots and texts the hosts' review list judges (D51).
  review?: TypedReview<ContentOf<T>, AnswerOf<T>>;
};
