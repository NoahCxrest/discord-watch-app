
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getApplicationById } from "~/server/db/applications";
import { GuildCountChart } from "../../../components/guild-count-chart";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) return { title: "Not found" };
  return { title: app.name };
}
export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getApplicationById(id);
  if (!app) return notFound();


  const banner = app.botBanner;
  const bannerColor = app.botBannerColor;

  return (
    <div className="relative">
      {/* Banner */}
      {banner && (
        <div
          className="relative w-full h-64 md:h-[40vh] overflow-hidden bg-muted"
          style={{ background: bannerColor ?? undefined }}
        >
          <Image
            src={`https://cdn.discordapp.com/banners/${app.id}/${banner}.png?size=1024`}
            alt="Banner"
            className="object-cover w-full h-full"
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        </div>
      )}

      {/* Header section overlaps banner */}
      <div className="max-w-4xl mx-auto px-4 relative -mt-16">
        <div className="flex items-end gap-4">
          <Image
            src={`https://cdn.discordapp.com/avatars/${app.id}/${app.icon}.png?size=128`}
            alt={app.name}
            className="size-24 rounded-full border-4 border-background shadow-lg"
            width={96}
            height={96}
            priority
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
          <div className="mb-4 text-base text-foreground prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                a: (props) => (
                  <a {...props} className="prose-a:underline prose-a:text-primary" target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {app.description
                // Remove custom emoji and inaccessible image links
                .replace(/<:[^:]+:\d+>/g, "")
                .replace(/<a?:[^:]+:\d+>/g, "")
                .replace(/https:\/\/cdn.discordapp.com\/emojis\/\d+\.(?:png|gif|jpg)/g, "")
              }
            </ReactMarkdown>
          </div>
        )}

        {/* Guild Count Chart */}
        <div className="mt-8">
          <GuildCountChart botId={app.id} />
        </div>
      </div>
    </div>
  );
}

