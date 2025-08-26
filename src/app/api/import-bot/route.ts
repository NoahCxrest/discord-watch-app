import { NextRequest, NextResponse } from "next/server";
import { applications } from "~/server/db/schema";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
  const { botId } = await req.json();
  if (!botId) {
    return NextResponse.json({ error: "Missing botId" }, { status: 400 });
  }
  const url = `https://discord.com/api/v9/application-directory-static/applications/${botId}?locale=en-US`;
  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch from Discord API");
    data = await res.json();
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch Discord data" }, { status: 500 });
  }
  try {
    await db.insert(applications).values({
      id: data.id,
      name: data.name,
      icon: data.icon,
      description: data.description,
      isVerified: data.is_verified ? 1 : 0,
      botId: data.bot?.id,
      botUsername: data.bot?.username,
      botGlobalName: data.bot?.global_name,
      botAvatar: data.bot?.avatar,
      botBanner: data.bot?.banner,
      botBannerColor: data.bot?.banner_color,
      botAccentColor: data.bot?.accent_color,
      guildCount: data.directory_entry?.guild_count?.toString(),
      detailedDescription: data.directory_entry?.short_description || data.description,
    });
    return NextResponse.json({ success: true, name: data.name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "DB insert failed" }, { status: 500 });
  }
}
