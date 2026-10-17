import { defineSchema } from "convex/server";
import { questionsTable } from "./questions/table";
import { quizzesTable } from "./quizzes/table";
import { roundsTable } from "./rounds/table";

export default defineSchema({
  quizzes: quizzesTable,
  rounds: roundsTable,
  questions: questionsTable,
});
