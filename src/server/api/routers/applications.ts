
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { getAllApplications, searchApplications } from "~/server/db/applications";
import type { ApplicationSelect } from "~/types/application";


export const applicationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async (): Promise<ApplicationSelect[]> => {
    return await getAllApplications();
  }),
  search: publicProcedure.input(z.object({ query: z.string(), filter: z.enum(["id", "text"]).default("text") })).query(async ({ input }): Promise<ApplicationSelect[]> => {
    return await searchApplications(input.query, input.filter);
  }),
});
