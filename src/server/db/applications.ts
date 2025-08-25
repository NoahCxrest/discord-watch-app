import { db } from "./index";
import { applications } from "./schema";

import { like, or } from "drizzle-orm";

/**
 * Fetch all applications from the database.
 */
export async function getAllApplications() {
	return await db.select().from(applications);
}

/**
 * Search applications by name or description.
 */
export async function searchApplications(query: string) {
	return await db
		.select()
		.from(applications)
		.where(
			or(
				like(applications.name, `%${query}%`),
				like(applications.description, `%${query}%`)
			)
		);
}
