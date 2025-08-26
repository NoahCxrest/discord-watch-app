import { notFound } from "next/navigation";
import { getApplicationById } from "~/server/db/applications";
import { getGuildCountHistory } from "~/server/db/guildCount";
import type { Metadata } from "next";
import { GuildCountChart } from "./guild-count-chart";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) return { title: "Not found" };
  return { title: app.name };
}
export default async function ApplicationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const app = await getApplicationById(id);
  if (!app) return notFound();

  // Fetch initial guild count data (last 24 entries)
  let initialGuildCountData: Array<{ date: string; guildCount: number }> = [];
  try {
    initialGuildCountData = await getGuildCountHistory(app.id, 24);
  } catch (e) {
    // fail silently, chart will handle empty data
  }

  const banner = app.botBanner;
  const bannerColor = app.botBannerColor;

  return (
    <div className="relative">
      {/* Banner */}
      {banner && (
        <div
          className="relative w-full h-64 md:h-[40vh] overflow-hidden bg-muted"
          style={{ background: bannerColor || undefined }}
        >
          <img
            src={`https://cdn.discordapp.com/banners/${app.id}/${banner}.png?size=1024`}
            alt="Banner"
            className="object-cover w-full h-full"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        </div>
      )}

      {/* Header section overlaps banner */}
      <div className="max-w-4xl mx-auto px-4 relative -mt-16">
        <div className="flex items-end gap-4">
          <img
            src={`https://cdn.discordapp.com/avatars/${app.id}/${app.icon}.png?size=128`}
            alt={app.name}
            className="size-24 rounded-full border-4 border-background shadow-lg"
          />
          <div className="pb-2">
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <p className="text-muted-foreground text-sm">ID: {app.id}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 mt-6 pb-10">
        {app.description && (
          <p className="mb-4 text-base text-foreground">{app.description}</p>
        )}
        {app.detailedDescription && (
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: app.detailedDescription }}
          />
        )}

        {/* Guild Count Chart */}
        <div className="mt-8">
          <GuildCountChart botId={app.id} initialData={initialGuildCountData} />
        </div>
      </div>
    </div>
  );
}

