import r2 from "@convex-dev/r2/convex.config.js";
import { defineApp } from "convex/server";

// Films live in Cloudflare R2 instead of Convex storage, where downloads are free (D32).
const app = defineApp();
app.use(r2);

export default app;
