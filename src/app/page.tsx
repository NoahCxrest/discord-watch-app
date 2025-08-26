import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { applications } from "~/server/db/schema";

/**
 * Fetch the first application by id order.
 */
export async function getFirstApplication() {
  const firstApp = (await db.select().from(applications).orderBy(applications.id).limit(1))?.[0];
  return firstApp ?? null;
}

export default async function Home() {
  const firstApp = await getFirstApplication();

  if (firstApp?.id) {
    redirect(`/applications/${firstApp.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h1 className="text-2xl font-bold mb-2">No Applications</h1>
      <p className="text-muted-foreground">how tf did this happen</p>
    </div>
  );
}
