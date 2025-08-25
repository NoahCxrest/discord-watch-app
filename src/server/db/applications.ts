import { db } from "./index";
import { applications } from "./schema";

import { like, or } from "drizzle-orm";

/**
 * Fetch all applications from the database.
 */
export async function getAllApplications() {
	return await db
		.select({
			id: applications.id,
			name: applications.name,
			icon: applications.icon,
			description: applications.description,
		})
		.from(applications);
}

/**
 * Search applications by name, description, or id.
 */
export async function searchApplications(query: string, filter: "id" | "text" = "text") {
	if (filter === "id") {
		return await db
			.select()
			.from(applications)
			.where(like(applications.id, `%${query}%`));
	}
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
