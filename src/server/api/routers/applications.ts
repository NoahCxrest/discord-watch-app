import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import {
  getAllApplications,
  searchApplications,
  getPaginatedApplications,
} from "~/server/db/applications";
import type {
  ApplicationListItem,
  ApplicationSelect,
} from "~/types/application";

export const applicationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async (): Promise<ApplicationListItem[]> => {
    return await getAllApplications();
  }),
  
  getPaginated: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(), // or use number for offset
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      return await getPaginatedApplications(input.cursor, input.limit);
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        filter: z.enum(["id", "text"]).default("text"),
      }),
    )
    .query(async ({ input }): Promise<ApplicationSelect[]> => {
      return await searchApplications(input.query, input.filter);
    }),
});
