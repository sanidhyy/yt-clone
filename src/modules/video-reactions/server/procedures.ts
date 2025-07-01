import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { ReactionType, videoReactions } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const videoReactionsRouter = createTRPCRouter({
	dislike: protectedProcedure.input(z.object({ videoId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { videoId } = input;

		const [existingVideoDislikeReaction] = await db
			.select()
			.from(videoReactions)
			.where(
				and(
					eq(videoReactions.type, ReactionType.DISLIKE),
					eq(videoReactions.userId, userId),
					eq(videoReactions.videoId, videoId)
				)
			);

		if (existingVideoDislikeReaction) {
			const [deletedViewerReaction] = await db
				.delete(videoReactions)
				.where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId)))
				.returning();

			return deletedViewerReaction;
		}

		const [videoReaction] = await db
			.insert(videoReactions)
			.values({ type: ReactionType.DISLIKE, userId, videoId })
			// in case user liked video earlier
			.onConflictDoUpdate({
				set: {
					type: ReactionType.DISLIKE,
				},
				target: [videoReactions.userId, videoReactions.videoId],
			})
			.returning();

		return videoReaction;
	}),
	like: protectedProcedure.input(z.object({ videoId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { videoId } = input;

		const [existingVideoLikeReaction] = await db
			.select()
			.from(videoReactions)
			.where(
				and(
					eq(videoReactions.type, ReactionType.LIKE),
					eq(videoReactions.userId, userId),
					eq(videoReactions.videoId, videoId)
				)
			);

		if (existingVideoLikeReaction) {
			const [deletedViewerReaction] = await db
				.delete(videoReactions)
				.where(and(eq(videoReactions.userId, userId), eq(videoReactions.videoId, videoId)))
				.returning();

			return deletedViewerReaction;
		}

		const [videoReaction] = await db
			.insert(videoReactions)
			.values({ type: ReactionType.LIKE, userId, videoId })
			// in case user disliked video earlier
			.onConflictDoUpdate({
				set: {
					type: ReactionType.LIKE,
				},
				target: [videoReactions.userId, videoReactions.videoId],
			})
			.returning();

		return videoReaction;
	}),
});
