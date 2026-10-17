import { v } from "convex/values";
import { questionContent } from "./questionContent";

// Derived from the content union, so a new question type is accepted here automatically.
export const questionType = v.union(...questionContent.members.map((member) => member.fields.type));
