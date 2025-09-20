import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { ReactionType, VideoVisibility, users, videoReactions, videoViews, videos } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const playlistsRouter = createTRPCRouter({
	getHistory: protectedProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						viewedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { cursor, limit } = input;

			const viewerVideoViews = db.$with('viewer_video_views').as(
				db
					.select({
						videoId: videoViews.videoId,
						viewedAt: videoViews.updatedAt,
					})
					.from(videoViews)
					.where(eq(videoViews.userId, userId))
			);

			const data = await db
				.with(viewerVideoViews)
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
					viewedAt: viewerVideoViews.viewedAt,
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
				.where(
					and(
						eq(videos.visibility, VideoVisibility.PUBLIC),
						cursor
							? or(
									lt(viewerVideoViews.viewedAt, cursor.viewedAt),
									and(eq(viewerVideoViews.viewedAt, cursor.viewedAt), lt(videos.id, cursor.id))
								)
							: undefined
					)
				)
				.orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, viewedAt: lastItem.viewedAt } : null;

			return {
				items,
				nextCursor,
			};
		}),
	getLiked: protectedProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						likedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { cursor, limit } = input;

			const viewerVideoReactions = db.$with('viewer_video_reactions').as(
				db
					.select({
						likedAt: videoReactions.updatedAt,
						videoId: videoReactions.videoId,
					})
					.from(videoReactions)
					.where(and(eq(videoReactions.type, ReactionType.LIKE), eq(videoReactions.userId, userId)))
			);

			const data = await db
				.with(viewerVideoReactions)
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
					likedAt: viewerVideoReactions.likedAt,
					user: users,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.innerJoin(viewerVideoReactions, eq(videos.id, viewerVideoReactions.videoId))
				.where(
					and(
						eq(videos.visibility, VideoVisibility.PUBLIC),
						cursor
							? or(
									lt(viewerVideoReactions.likedAt, cursor.likedAt),
									and(eq(viewerVideoReactions.likedAt, cursor.likedAt), lt(videos.id, cursor.id))
								)
							: undefined
					)
				)
				.orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, likedAt: lastItem.likedAt } : null;

			return {
				items,
				nextCursor,
			};
		}),
});
