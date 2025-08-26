import { db } from "./index";
import { applicationStats } from "./schema";
import { sql } from "drizzle-orm";

/**
 * Fetches guild count history for a bot, ordered by recordedAt ascending.
 * @param botId The bot's ID
 * @param limit Max number of records to fetch (default 90)
 */
export async function getGuildCountHistory(botId: string, limit = 90) {
  const rows = await db.select({
    date: applicationStats.recordedAt,
    guildCount: applicationStats.guildCount,
  })
    .from(applicationStats)
    .where(sql`bot_id = ${botId}`)
    .orderBy(applicationStats.recordedAt)
    .limit(limit);

  return rows.map(row => ({
    date: new Date(row.date).toISOString(),
    guildCount: row.guildCount,
  }));
}
