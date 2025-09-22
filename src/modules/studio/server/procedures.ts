import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { ReactionType, comments, videoReactions, videoViews, videos } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const studioRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ ctx, input }) => {
			const { cursor, limit } = input;
			const { id: userId } = ctx.user;

			const data = await db
				.select({
					...getTableColumns(videos),
					commentCount: db.$count(comments, eq(comments.videoId, videos.id)),
					likeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.type, ReactionType.LIKE), eq(videoReactions.videoId, videos.id))
					),
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
				})
				.from(videos)
				.where(
					and(
						eq(videos.userId, userId),
						cursor
							? or(
									lt(videos.updatedAt, cursor.updatedAt),
									and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
								)
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

			return {
				items,
				nextCursor,
			};
		}),
	getOne: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id } = input;

		const [video] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)));

		if (!video) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		return video;
	}),
});
