import { ConvexError } from "convex/values";

const FALLBACK = "Något gick fel. Kontrollera anslutningen och försök igen.";

// Our Convex functions throw ConvexError with a Swedish message meant for the hosts;
// anything else (network, bugs) gets a general message.
export function describeActionError(error: unknown): string {
  return error instanceof ConvexError && typeof error.data === "string" ? error.data : FALLBACK;
}
