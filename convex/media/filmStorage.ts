import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";

// The R2 bucket for films, configured by the R2_* environment variables (docs/deploy.md, D32).
export const filmStorage = new R2(components.r2);
