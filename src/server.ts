import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

await connectDB();
createApp().listen(env.port, () => console.log(`API on :${env.port}`));
