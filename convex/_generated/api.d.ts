/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adjustments_table from "../adjustments/table.js";
import type * as answers_answerContent from "../answers/answerContent.js";
import type * as answers_table from "../answers/table.js";
import type * as auth_hostFunctions from "../auth/hostFunctions.js";
import type * as auth_isHostPassphrase from "../auth/isHostPassphrase.js";
import type * as auth_queries from "../auth/queries.js";
import type * as auth_requireHost from "../auth/requireHost.js";
import type * as games_deleteGame from "../games/deleteGame.js";
import type * as games_findRunningGame from "../games/findRunningGame.js";
import type * as games_gamesOfQuiz from "../games/gamesOfQuiz.js";
import type * as games_moveScreen from "../games/moveScreen.js";
import type * as games_mutations from "../games/mutations.js";
import type * as games_queries from "../games/queries.js";
import type * as games_screen from "../games/screen.js";
import type * as games_screenSequenceOfQuiz from "../games/screenSequenceOfQuiz.js";
import type * as games_table from "../games/table.js";
import type * as media_filmStorage from "../media/filmStorage.js";
import type * as media_mutations from "../media/mutations.js";
import type * as media_queries from "../media/queries.js";
import type * as questions_acceptedItem from "../questions/acceptedItem.js";
import type * as questions_insertQuestion from "../questions/insertQuestion.js";
import type * as questions_mutations from "../questions/mutations.js";
import type * as questions_numberOrNull from "../questions/numberOrNull.js";
import type * as questions_questionContent from "../questions/questionContent.js";
import type * as questions_questionType from "../questions/questionType.js";
import type * as questions_questionsOfRound from "../questions/questionsOfRound.js";
import type * as questions_requireFilmQuestionType from "../questions/requireFilmQuestionType.js";
import type * as questions_saveQuestionOrder from "../questions/saveQuestionOrder.js";
import type * as questions_table from "../questions/table.js";
import type * as questions_types_activity_activityContent from "../questions/types/activity/activityContent.js";
import type * as questions_types_drawing_drawingAnswer from "../questions/types/drawing/drawingAnswer.js";
import type * as questions_types_drawing_drawingContent from "../questions/types/drawing/drawingContent.js";
import type * as questions_types_freeText_freeTextAnswer from "../questions/types/freeText/freeTextAnswer.js";
import type * as questions_types_freeText_freeTextContent from "../questions/types/freeText/freeTextContent.js";
import type * as questions_types_ingredients_ingredientsAnswer from "../questions/types/ingredients/ingredientsAnswer.js";
import type * as questions_types_ingredients_ingredientsContent from "../questions/types/ingredients/ingredientsContent.js";
import type * as questions_types_list_listAnswer from "../questions/types/list/listAnswer.js";
import type * as questions_types_list_listContent from "../questions/types/list/listContent.js";
import type * as questions_types_mapPin_mapPinAnswer from "../questions/types/mapPin/mapPinAnswer.js";
import type * as questions_types_mapPin_mapPinContent from "../questions/types/mapPin/mapPinContent.js";
import type * as questions_types_match_matchAnswer from "../questions/types/match/matchAnswer.js";
import type * as questions_types_match_matchContent from "../questions/types/match/matchContent.js";
import type * as questions_types_multipleChoice_multipleChoiceAnswer from "../questions/types/multipleChoice/multipleChoiceAnswer.js";
import type * as questions_types_multipleChoice_multipleChoiceContent from "../questions/types/multipleChoice/multipleChoiceContent.js";
import type * as questions_types_number_numberAnswer from "../questions/types/number/numberAnswer.js";
import type * as questions_types_number_numberContent from "../questions/types/number/numberContent.js";
import type * as questions_types_paSparet_paSparetAnswer from "../questions/types/paSparet/paSparetAnswer.js";
import type * as questions_types_paSparet_paSparetContent from "../questions/types/paSparet/paSparetContent.js";
import type * as questions_types_sort_sortAnswer from "../questions/types/sort/sortAnswer.js";
import type * as questions_types_sort_sortContent from "../questions/types/sort/sortContent.js";
import type * as quizzes_mutations from "../quizzes/mutations.js";
import type * as quizzes_queries from "../quizzes/queries.js";
import type * as quizzes_table from "../quizzes/table.js";
import type * as quizzes_touchQuiz from "../quizzes/touchQuiz.js";
import type * as rounds_filmMutations from "../rounds/filmMutations.js";
import type * as rounds_mutations from "../rounds/mutations.js";
import type * as rounds_roundsOfQuiz from "../rounds/roundsOfQuiz.js";
import type * as rounds_roundsWithQuestionsOfQuiz from "../rounds/roundsWithQuestionsOfQuiz.js";
import type * as rounds_saveRoundOrder from "../rounds/saveRoundOrder.js";
import type * as rounds_table from "../rounds/table.js";
import type * as shared_getOrThrow from "../shared/getOrThrow.js";
import type * as teams_mutations from "../teams/mutations.js";
import type * as teams_queries from "../teams/queries.js";
import type * as teams_table from "../teams/table.js";
import type * as teams_teamsOfGame from "../teams/teamsOfGame.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "adjustments/table": typeof adjustments_table;
  "answers/answerContent": typeof answers_answerContent;
  "answers/table": typeof answers_table;
  "auth/hostFunctions": typeof auth_hostFunctions;
  "auth/isHostPassphrase": typeof auth_isHostPassphrase;
  "auth/queries": typeof auth_queries;
  "auth/requireHost": typeof auth_requireHost;
  "games/deleteGame": typeof games_deleteGame;
  "games/findRunningGame": typeof games_findRunningGame;
  "games/gamesOfQuiz": typeof games_gamesOfQuiz;
  "games/moveScreen": typeof games_moveScreen;
  "games/mutations": typeof games_mutations;
  "games/queries": typeof games_queries;
  "games/screen": typeof games_screen;
  "games/screenSequenceOfQuiz": typeof games_screenSequenceOfQuiz;
  "games/table": typeof games_table;
  "media/filmStorage": typeof media_filmStorage;
  "media/mutations": typeof media_mutations;
  "media/queries": typeof media_queries;
  "questions/acceptedItem": typeof questions_acceptedItem;
  "questions/insertQuestion": typeof questions_insertQuestion;
  "questions/mutations": typeof questions_mutations;
  "questions/numberOrNull": typeof questions_numberOrNull;
  "questions/questionContent": typeof questions_questionContent;
  "questions/questionType": typeof questions_questionType;
  "questions/questionsOfRound": typeof questions_questionsOfRound;
  "questions/requireFilmQuestionType": typeof questions_requireFilmQuestionType;
  "questions/saveQuestionOrder": typeof questions_saveQuestionOrder;
  "questions/table": typeof questions_table;
  "questions/types/activity/activityContent": typeof questions_types_activity_activityContent;
  "questions/types/drawing/drawingAnswer": typeof questions_types_drawing_drawingAnswer;
  "questions/types/drawing/drawingContent": typeof questions_types_drawing_drawingContent;
  "questions/types/freeText/freeTextAnswer": typeof questions_types_freeText_freeTextAnswer;
  "questions/types/freeText/freeTextContent": typeof questions_types_freeText_freeTextContent;
  "questions/types/ingredients/ingredientsAnswer": typeof questions_types_ingredients_ingredientsAnswer;
  "questions/types/ingredients/ingredientsContent": typeof questions_types_ingredients_ingredientsContent;
  "questions/types/list/listAnswer": typeof questions_types_list_listAnswer;
  "questions/types/list/listContent": typeof questions_types_list_listContent;
  "questions/types/mapPin/mapPinAnswer": typeof questions_types_mapPin_mapPinAnswer;
  "questions/types/mapPin/mapPinContent": typeof questions_types_mapPin_mapPinContent;
  "questions/types/match/matchAnswer": typeof questions_types_match_matchAnswer;
  "questions/types/match/matchContent": typeof questions_types_match_matchContent;
  "questions/types/multipleChoice/multipleChoiceAnswer": typeof questions_types_multipleChoice_multipleChoiceAnswer;
  "questions/types/multipleChoice/multipleChoiceContent": typeof questions_types_multipleChoice_multipleChoiceContent;
  "questions/types/number/numberAnswer": typeof questions_types_number_numberAnswer;
  "questions/types/number/numberContent": typeof questions_types_number_numberContent;
  "questions/types/paSparet/paSparetAnswer": typeof questions_types_paSparet_paSparetAnswer;
  "questions/types/paSparet/paSparetContent": typeof questions_types_paSparet_paSparetContent;
  "questions/types/sort/sortAnswer": typeof questions_types_sort_sortAnswer;
  "questions/types/sort/sortContent": typeof questions_types_sort_sortContent;
  "quizzes/mutations": typeof quizzes_mutations;
  "quizzes/queries": typeof quizzes_queries;
  "quizzes/table": typeof quizzes_table;
  "quizzes/touchQuiz": typeof quizzes_touchQuiz;
  "rounds/filmMutations": typeof rounds_filmMutations;
  "rounds/mutations": typeof rounds_mutations;
  "rounds/roundsOfQuiz": typeof rounds_roundsOfQuiz;
  "rounds/roundsWithQuestionsOfQuiz": typeof rounds_roundsWithQuestionsOfQuiz;
  "rounds/saveRoundOrder": typeof rounds_saveRoundOrder;
  "rounds/table": typeof rounds_table;
  "shared/getOrThrow": typeof shared_getOrThrow;
  "teams/mutations": typeof teams_mutations;
  "teams/queries": typeof teams_queries;
  "teams/table": typeof teams_table;
  "teams/teamsOfGame": typeof teams_teamsOfGame;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
};
