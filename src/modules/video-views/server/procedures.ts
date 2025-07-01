import { z } from 'zod';

import { db } from '@/db';
import { videoViews } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const videoViewsRouter = createTRPCRouter({
	create: protectedProcedure.input(z.object({ videoId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { videoId } = input;

		const [videoView] = await db
			.insert(videoViews)
			.values({ userId, videoId })
			.onConflictDoUpdate({ set: { updatedAt: new Date() }, target: [videoViews.userId, videoViews.videoId] })
			.returning();

		return videoView;
	}),
});
