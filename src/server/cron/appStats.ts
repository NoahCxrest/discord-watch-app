import { db } from "../db";
import { applications, appStats, botScanLog } from "../db/schema";
import { sql, eq } from "drizzle-orm";

interface BotStats {
  botId: string;
  guildCount: number;
}

interface DiscordApiResponse {
  directory_entry?: {
    guild_count?: string | number;
  };
}

const DISCORD_API_BASE = "https://discord.com/api/v9";
const SCAN_INTERVAL_HOURS = 1;
const LOG_PREFIX = "[appStatsCron]";

/**
 * Fetches bot statistics from Discord API
 */
async function fetchBotStats(botId: string): Promise<BotStats | null> {
  const url = `${DISCORD_API_BASE}/application-directory-static/applications/${botId}?locale=en-US`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`${LOG_PREFIX} Discord API returned ${response.status} for bot ${botId}`);
      return null;
    }
    
    const data: DiscordApiResponse = await response.json();
    const rawGuildCount = data.directory_entry?.guild_count;
    
    if (!rawGuildCount) {
      console.warn(`${LOG_PREFIX} No guild count data for bot ${botId}`);
      return null;
    }
    
    const guildCount = typeof rawGuildCount === 'number' 
      ? rawGuildCount 
      : parseInt(String(rawGuildCount), 10);
    
    if (isNaN(guildCount) || guildCount < 0) {
      console.warn(`${LOG_PREFIX} Invalid guild count for bot ${botId}: ${rawGuildCount}`);
      return null;
    }
    
    return { botId, guildCount };
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching stats for bot ${botId}:`, error);
    return null;
  }
}

/**
 * Checks if a bot was scanned within the specified interval
 */
async function wasRecentlyScanned(botId: string): Promise<boolean> {
  const scanIntervalMs = SCAN_INTERVAL_HOURS * 60 * 60 * 1000;
  const cutoffTime = new Date(Date.now() - scanIntervalMs);
  
  try {
    const scanLog = await db
      .select({ lastScannedAt: botScanLog.lastScannedAt })
      .from(botScanLog)
      .where(eq(botScanLog.botId, botId))
      .limit(1);
    
    if (!scanLog[0]?.lastScannedAt) {
      return false;
    }
    
    const lastScannedAt = new Date(scanLog[0].lastScannedAt);
    return lastScannedAt > cutoffTime;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error checking scan log for bot ${botId}:`, error);
    return false; // Assume not scanned to be safe
  }
}

/**
 * Saves bot statistics to the database
 */
async function saveBotStats(stats: BotStats): Promise<void> {
  try {
    await db.insert(appStats).values({
      botId: stats.botId,
      guildCount: stats.guildCount,
    });
    
    console.log(`${LOG_PREFIX} Saved stats for bot ${stats.botId}: guildCount=${stats.guildCount}`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error saving stats for bot ${stats.botId}:`, error);
    throw error;
  }
}

/**
 * Updates the scan log for a bot
 */
async function updateScanLog(botId: string): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  try {
    await db
      .insert(botScanLog)
      .values({
        botId,
        lastScannedAt: now,
      })
      .onDuplicateKeyUpdate({
        set: { lastScannedAt: now }
      });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error updating scan log for bot ${botId}:`, error);
    throw error;
  }
}

/**
 * Processes a single bot - fetches stats and saves to database
 */
async function processBotStats(botId: string): Promise<boolean> {
  try {
    // Check if recently scanned
    const recentlyScanned = await wasRecentlyScanned(botId);
    if (recentlyScanned) {
      console.log(`${LOG_PREFIX} Skipping recently scanned bot ${botId}`);
      return false;
    }
    
    // Fetch stats from Discord API
    const stats = await fetchBotStats(botId);
    if (!stats || stats.guildCount === 0) {
      console.warn(`${LOG_PREFIX} No valid stats for bot ${botId}`);
      return false;
    }
    
    // Save stats and update scan log
    await saveBotStats(stats);
    await updateScanLog(botId);
    
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error processing bot ${botId}:`, error);
    return false;
  }
}

/**
 * Main cron job function to update app statistics
 */
export async function runAppStatsCron(): Promise<void> {
  const startTime = new Date();
  console.log(`${LOG_PREFIX} Starting app stats cron at ${startTime.toISOString()}`);
  
  try {
    // Get all bots that need scanning
    const bots = await db
      .select({ botId: applications.botId })
      .from(applications)
      .where(sql`bot_id IS NOT NULL`);
    
    console.log(`${LOG_PREFIX} Found ${bots.length} bots to process`);
    
    // Process each bot
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    
    for (const { botId } of bots) {
      if (!botId) {
        skippedCount++;
        continue;
      }
      
      const success = await processBotStats(botId);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
    }
    
    const duration = Date.now() - startTime.getTime();
    console.log(
      `${LOG_PREFIX} Completed in ${duration}ms. ` +
      `Success: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`
    );
    
  } catch (error) {
    console.error(`${LOG_PREFIX} Critical error in cron job:`, error);
    throw error;
  }
}