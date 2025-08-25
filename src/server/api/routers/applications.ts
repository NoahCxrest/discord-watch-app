
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAllApplications } from "~/server/db/applications";
import type { ApplicationSelect } from "~/types/application";


export const applicationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async (): Promise<ApplicationSelect[]> => {
    return await getAllApplications();
  }),
});
