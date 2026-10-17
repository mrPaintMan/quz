/// <reference types="vite/client" />
// Shared by Convex tests. The extra dot in the file name keeps Convex from deploying it.
import { convexTest } from "convex-test";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

export const TEST_PASSPHRASE = "pepparkaka";
export const host = { hostPassphrase: TEST_PASSPHRASE };

export function setupConvexTest() {
  process.env.HOST_PASSPHRASE = TEST_PASSPHRASE;
  return convexTest(schema, modules);
}
