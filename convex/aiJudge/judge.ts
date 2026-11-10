import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { JUDGE_INSTRUCTIONS, JUDGE_REPLY_SCHEMA, readJudgeReply } from "@/domain/review/aiJudge";
import type { ReviewItem, ReviewSlot, Verdict } from "@/domain/review/typedReview";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

// Claude Haiku 5.5, chosen by the user: fast and nearly free, and spelling needs little thought (D50, D52).
const MODEL = "claude-haiku-5-5";

type Job = { message: string; slots: ReviewSlot[]; items: ReviewItem[] };

// One call to Claude about a question's texts, read into verdicts. A slow API fails within about
// 40 seconds (one retry), so the hosts soon know to judge themselves.
async function askClaude(job: Job): Promise<Verdict[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey, timeout: 20_000, maxRetries: 1 });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: JUDGE_INSTRUCTIONS,
    output_config: { effort: "low", format: { type: "json_schema", schema: JUDGE_REPLY_SCHEMA } },
    messages: [{ role: "user", content: job.message }],
  });
  const text = response.content.find((block) => block.type === "text")?.text;
  if (response.stop_reason !== "end_turn" || text === undefined) throw new Error(`The AI judge stopped: ${response.stop_reason}`);
  return readJudgeReply(JSON.parse(text), job.slots, job.items);
}

// Asks Claude once about a closed question's unjudged texts and saves its verdicts. Anything that
// goes wrong (no key, an API error, a refusal, an odd reply) leaves the texts for the hosts (D52).
export const judgeQuestion = internalAction({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, ids) => {
    try {
      const job = await ctx.runQuery(internal.aiJudge.judging.prepareJudging, ids);
      const verdicts = job === null ? [] : await askClaude(job);
      await ctx.runMutation(internal.aiJudge.judging.saveAiVerdicts, { ...ids, verdicts });
    } catch (error) {
      console.error("AI judging failed", error);
      await ctx.runMutation(internal.aiJudge.judging.failJudging, ids);
    }
  },
});
