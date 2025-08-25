import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { applications } from "../server/db/schema";

export type ApplicationSelect = InferSelectModel<typeof applications>;
export type ApplicationInsert = InferInsertModel<typeof applications>;

export type ApplicationListItem = {
	id: string;
	name: string;
	icon: string | null;
	description: string | null;
};