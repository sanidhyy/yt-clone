import { and, desc, eq, getTableColumns, ilike, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { ReactionType, users, videoReactions, videoViews, videos } from '@/db/schema';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';

export const searchRouter = createTRPCRouter({
	getMany: baseProcedure
		.input(
			z.object({
				categoryId: z.string().uuid().nullish(),
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
				query: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { categoryId, cursor, limit, query } = input;

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
				.innerJoin(users, eq(videos.userId, users.id))
				.where(
					and(
						or(ilike(videos.title, `%${query}%`), ilike(videos.description, `%${query}%`)),
						categoryId ? eq(videos.categoryId, categoryId) : undefined,
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
});
