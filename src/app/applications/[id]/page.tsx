import { notFound } from "next/navigation";
import { getApplicationById } from "~/server/db/applications";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const app = await getApplicationById(params.id);
  if (!app) return { title: "Not found" };
  return { title: app.name };
}

export default async function ApplicationPage({ params }: { params: { id: string } }) {
  const app = await getApplicationById(params.id);
  if (!app) return notFound();

  // Use botBanner and botBannerColor from schema
  const banner = app.botBanner;
  const bannerColor = app.botBannerColor;

  return (
    <>
      {/* Banner is absolutely positioned edge-to-edge */}
      {banner && (
        <div className="w-full h-72 md:h-[50vh] overflow-hidden relative flex items-center justify-center bg-muted" style={{ background: bannerColor || undefined }}>
          <img
            src={`https://cdn.discordapp.com/banners/${app.id}/${banner}.png?size=1024`}
            alt="Banner"
            className="object-cover w-full h-full"
          />
          {/* Fade to background color overlay */}
          {/* Easing blur and fade overlay */}
          <div className="pointer-events-none absolute left-0 top-1/3 w-full h-2/3">
            {/* Easing blur overlay using a gradient mask */}
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%)",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            />
            {/* Color fade overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, var(--background, #09090b) 100%)"
              }}
            />
          </div>
        </div>
      )}
      {/* Spacer to push content below the banner */}
      {banner && <div className="mb-6" />}
      {/* Main content with padding and margin to separate from banner */}
      <div className="max-w-2xl mx-auto pb-10 px-4">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={`https://cdn.discordapp.com/avatars/${app.id}/${app.icon}.png?size=128`}
            alt={app.name}
            className="size-16 rounded-full border"
          />
          <div>
            <h1 className="text-2xl font-bold">{app.name}</h1>
            <div className="text-muted-foreground text-sm">ID: {app.id}</div>
          </div>
        </div>
        {app.description && (
          <p className="mb-4 text-base text-foreground">{app.description}</p>
        )}
        {app.detailedDescription && (
          <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: app.detailedDescription }} />
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Verified:</span> {app.isVerified ? "Yes" : "No"}</div>
          {app.botUsername && <div><span className="font-medium">Bot Username:</span> {app.botUsername}</div>}
          {app.guildCount && <div><span className="font-medium">Guild Count:</span> {app.guildCount}</div>}
          {app.createdAt && <div><span className="font-medium">Created:</span> {app.createdAt}</div>}
          {app.updatedAt && <div><span className="font-medium">Updated:</span> {app.updatedAt}</div>}
        </div>
      </div>
    </>
  );
}
