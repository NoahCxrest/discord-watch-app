import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { applicationStats } from "../server/db/schema";

export type AppStatsSelect = InferSelectModel<typeof applicationStats>;
export type AppStatsInsert = InferInsertModel<typeof applicationStats>;
