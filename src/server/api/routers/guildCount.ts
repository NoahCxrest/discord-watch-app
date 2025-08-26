import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { getGuildCountHistory } from "~/server/db/guildCount";

export const guildCountRouter = createTRPCRouter({
  history: publicProcedure.input(z.object({ botId: z.string(), limit: z.number().optional() })).query(async ({ input }) => {
    return await getGuildCountHistory(input.botId, input.limit ?? 24);
  }),
});
