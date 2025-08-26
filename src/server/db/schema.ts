import { mysqlTable, tinyint, primaryKey, varchar, text, mediumtext, timestamp, bigint, index } from "drizzle-orm/mysql-core"

export const applications = mysqlTable("applications", {
	id: varchar({ length: 32 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 64 }),
	description: text(),
	isVerified: tinyint("is_verified").default(0).notNull(),
	botId: varchar("bot_id", { length: 32 }),
	botUsername: varchar("bot_username", { length: 100 }),
	botGlobalName: varchar("bot_global_name", { length: 100 }),
	botAvatar: varchar("bot_avatar", { length: 64 }),
	botBanner: varchar("bot_banner", { length: 64 }),
	botBannerColor: varchar("bot_banner_color", { length: 12 }),
	botAccentColor: varchar("bot_accent_color", { length: 12 }),
	guildCount: varchar("guild_count", { length: 16 }),
	detailedDescription: mediumtext("detailed_description"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "applications_id"}),
]);

export const appStats = mysqlTable("app_stats", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().notNull(),
  botId: varchar("bot_id", { length: 32 }).notNull(),
  guildCount: bigint("guild_count", { mode: "number", unsigned: true }).notNull(),
  recordedAt: timestamp("recorded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.id], name: "PRIMARY" }),
  index("bot_id_idx").on(table.botId),
  index("recorded_at_idx").on(table.recordedAt),
]);
