import { defineSchema } from "convex/server";
import { adjustmentsTable } from "./adjustments/table";
import { answersTable } from "./answers/table";
import { gamesTable } from "./games/table";
import { questionsTable } from "./questions/table";
import { quizzesTable } from "./quizzes/table";
import { roundsTable } from "./rounds/table";
import { teamsTable } from "./teams/table";

export default defineSchema({
  quizzes: quizzesTable,
  rounds: roundsTable,
  questions: questionsTable,
  games: gamesTable,
  teams: teamsTable,
  answers: answersTable,
  adjustments: adjustmentsTable,
});
