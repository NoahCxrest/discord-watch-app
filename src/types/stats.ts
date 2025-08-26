import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { appStats } from "../server/db/schema";

export type AppStatsSelect = InferSelectModel<typeof appStats>;
export type AppStatsInsert = InferInsertModel<typeof appStats>;
