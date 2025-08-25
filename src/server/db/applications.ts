import { db } from "./index";
import { applications } from "./schema";

/**
 * Fetch all applications from the database.
 */
export async function getAllApplications() {
	return await db.select().from(applications);
}
