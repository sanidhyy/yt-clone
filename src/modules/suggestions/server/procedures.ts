import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, lt, not, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { ReactionType, VideoVisibility, users, videoReactions, videoViews, videos } from '@/db/schema';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';

export const suggestionsRouter = createTRPCRouter({
	getMany: baseProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
				videoId: z.string().uuid(),
			})
		)
		.query(async ({ input }) => {
			const { cursor, limit, videoId } = input;

			const [existingVideo] = await db.select().from(videos).where(eq(videos.id, videoId));

			if (!existingVideo) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });
			}

			const data = await db
				.select({
					...getTableColumns(videos),
					dislikeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, ReactionType.DISLIKE))
					),
					likeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, ReactionType.LIKE))
					),
					user: users,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
				})
				.from(videos)
				.where(
					and(
						not(eq(videos.id, existingVideo.id)),
						eq(videos.visibility, VideoVisibility.PUBLIC),
						existingVideo.categoryId ? eq(videos.categoryId, existingVideo.categoryId) : undefined,
						cursor
							? or(
									lt(videos.updatedAt, cursor.updatedAt),
									and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
								)
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id))
				.innerJoin(users, eq(videos.userId, users.id))
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
});
