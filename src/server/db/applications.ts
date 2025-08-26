import { eq, gt, like, or } from "drizzle-orm";
import { db } from "./index";
import { applications } from "./schema";
/**
 * Fetch applications with cursor-based pagination.
 * If cursor is provided, fetch applications with id > cursor (assuming id is sortable, otherwise use offset-based pagination).
 */
export async function getPaginatedApplications(cursor?: string, limit = 20) {
	if (cursor) {
		return await db
			.select({
				id: applications.id,
				name: applications.name,
				icon: applications.icon,
				description: applications.description,
			})
			.from(applications)
			.where(gt(applications.id, cursor))
			.limit(limit);
	} else {
		return await db
			.select({
				id: applications.id,
				name: applications.name,
				icon: applications.icon,
				description: applications.description,
			})
			.from(applications)
			.limit(limit);
	}
}


/**
 * Fetch all applications from the database (only used fields).
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
 * Fetch a single application by id (all fields).
 */
export async function getApplicationById(id: string) {
	const result = await db.select().from(applications).where(eq(applications.id, id));
	return result[0] ?? null;
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
