/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as questions_acceptedItem from "../questions/acceptedItem.js";
import type * as questions_questionContent from "../questions/questionContent.js";
import type * as questions_table from "../questions/table.js";
import type * as questions_types_activity_activityContent from "../questions/types/activity/activityContent.js";
import type * as questions_types_drawing_drawingContent from "../questions/types/drawing/drawingContent.js";
import type * as questions_types_freeText_freeTextContent from "../questions/types/freeText/freeTextContent.js";
import type * as questions_types_ingredients_ingredientsContent from "../questions/types/ingredients/ingredientsContent.js";
import type * as questions_types_list_listContent from "../questions/types/list/listContent.js";
import type * as questions_types_mapPin_mapPinContent from "../questions/types/mapPin/mapPinContent.js";
import type * as questions_types_match_matchContent from "../questions/types/match/matchContent.js";
import type * as questions_types_multipleChoice_multipleChoiceContent from "../questions/types/multipleChoice/multipleChoiceContent.js";
import type * as questions_types_number_numberContent from "../questions/types/number/numberContent.js";
import type * as questions_types_paSparet_paSparetContent from "../questions/types/paSparet/paSparetContent.js";
import type * as questions_types_sort_sortContent from "../questions/types/sort/sortContent.js";
import type * as quizzes_table from "../quizzes/table.js";
import type * as rounds_table from "../rounds/table.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "questions/acceptedItem": typeof questions_acceptedItem;
  "questions/questionContent": typeof questions_questionContent;
  "questions/table": typeof questions_table;
  "questions/types/activity/activityContent": typeof questions_types_activity_activityContent;
  "questions/types/drawing/drawingContent": typeof questions_types_drawing_drawingContent;
  "questions/types/freeText/freeTextContent": typeof questions_types_freeText_freeTextContent;
  "questions/types/ingredients/ingredientsContent": typeof questions_types_ingredients_ingredientsContent;
  "questions/types/list/listContent": typeof questions_types_list_listContent;
  "questions/types/mapPin/mapPinContent": typeof questions_types_mapPin_mapPinContent;
  "questions/types/match/matchContent": typeof questions_types_match_matchContent;
  "questions/types/multipleChoice/multipleChoiceContent": typeof questions_types_multipleChoice_multipleChoiceContent;
  "questions/types/number/numberContent": typeof questions_types_number_numberContent;
  "questions/types/paSparet/paSparetContent": typeof questions_types_paSparet_paSparetContent;
  "questions/types/sort/sortContent": typeof questions_types_sort_sortContent;
  "quizzes/table": typeof quizzes_table;
  "rounds/table": typeof rounds_table;
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

export declare const components: {};
