import { db } from "../db";
import { applications } from "../db/schema";
import { appStats } from "../db/schema";
import { sql } from "drizzle-orm";

async function fetchStats(botId: string) {
  const url = `https://discord.com/api/v9/application-directory-static/applications/${botId}?locale=en-US`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      botId,
      guildCount: typeof data.directory_entry?.guild_count === 'number' ? data.directory_entry.guild_count : parseInt(data.directory_entry?.guild_count || '0', 10),
    };
  } catch {
    return null;
  }
}

export async function runAppStatsCron() {
  const bots = await db.select({ botId: applications.botId }).from(applications).where(sql`bot_id IS NOT NULL`);
  for (const { botId } of bots) {
    if (!botId) continue;
    const stats = await fetchStats(botId);
    if (stats && stats.guildCount > 0) {
      await db.insert(appStats).values({
        botId: stats.botId,
        guildCount: stats.guildCount,
        // recordedAt will default to now
      });
    }
  }
}
