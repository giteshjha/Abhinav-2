import assert from "node:assert/strict";
import test from "node:test";

import {
  buildChatModelCandidates,
  DEFAULT_CHAT_MODEL,
  generateTextWithModelFallback,
} from "../src/lib/gemini";

test("defaults chat traffic to Gemma 4 and keeps fallbacks ordered", () => {
  assert.deepEqual(buildChatModelCandidates(), [
    DEFAULT_CHAT_MODEL,
    "gemma-3-27b-it",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ]);
});

test("deduplicates the fallback list when the primary model is already a fallback", () => {
  assert.deepEqual(buildChatModelCandidates("gemini-2.5-flash-lite"), [
    "gemini-2.5-flash-lite",
    "gemma-3-27b-it",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ]);
});

test("falls back to the next Gemini model when the primary model is unavailable", async () => {
  const attemptedModels: string[] = [];

  const result = await generateTextWithModelFallback(
    async (model) => {
      attemptedModels.push(model);

      if (model === DEFAULT_CHAT_MODEL) {
        throw { status: 404, message: `Model ${model} not found` };
      }

      return `ok:${model}`;
    },
    [DEFAULT_CHAT_MODEL, "gemma-3-27b-it"],
  );

  assert.equal(result, "ok:gemma-3-27b-it");
  assert.deepEqual(attemptedModels, [
    DEFAULT_CHAT_MODEL,
    "gemma-3-27b-it",
  ]);
});

test("preserves non-model errors so missing keys and bad requests stay visible", async () => {
  await assert.rejects(
    generateTextWithModelFallback(
      async () => {
        throw new Error("No API Key found");
      },
      [DEFAULT_CHAT_MODEL],
    ),
    /No API Key found/,
  );
});
