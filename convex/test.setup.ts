/// <reference types="vite/client" />
// Shared by Convex tests. The extra dot in the file name keeps Convex from deploying it.
import r2Test from "@convex-dev/r2/test";
import { convexTest } from "convex-test";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

export const TEST_PASSPHRASE = "pepparkaka";
export const host = { hostPassphrase: TEST_PASSPHRASE };
// The screen fields of a game that hasn't left the lobby, for tests inserting games directly.
export const atLobby = { screen: { kind: "lobby" as const }, screenIndex: 0 };

// A made-up bucket: signing links works offline, so tests never reach Cloudflare.
const TEST_R2 = {
  R2_BUCKET: "quz-films-test",
  R2_ENDPOINT: "https://test-account.r2.cloudflarestorage.com",
  R2_ACCESS_KEY_ID: "test-key-id",
  R2_SECRET_ACCESS_KEY: "test-secret",
  R2_TOKEN: "test-token",
};

export function setupConvexTest() {
  process.env.HOST_PASSPHRASE = TEST_PASSPHRASE;
  Object.assign(process.env, TEST_R2);
  const t = convexTest(schema, modules);
  r2Test.register(t);
  return t;
}
