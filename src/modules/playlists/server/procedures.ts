import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { playlistCreateSchema } from '@/modules/playlists/schemas/playlist-create-schema';

import { db } from '@/db';
import {
	ReactionType,
	VideoVisibility,
	playlistVideos,
	playlists,
	users,
	videoReactions,
	videoViews,
	videos,
} from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const playlistsRouter = createTRPCRouter({
	create: protectedProcedure.input(playlistCreateSchema).mutation(async ({ ctx, input }) => {
		const { name } = input;
		const { id: userId } = ctx.user;

		const [playlist] = await db
			.insert(playlists)
			.values({
				name,
				userId,
			})
			.returning();

		if (!playlist) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to create playlist!' });

		return playlist;
	}),
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
			const { id: userId } = ctx.user;
			const { cursor, limit } = input;

			const data = await db
				.select({
					...getTableColumns(playlists),
					user: users,
					videoCount: db.$count(playlistVideos, eq(playlists.id, playlistVideos.playlistId)),
				})
				.from(playlists)
				.innerJoin(users, eq(playlists.userId, users.id))
				.where(
					and(
						eq(playlists.userId, userId),
						cursor
							? or(
									lt(playlists.updatedAt, cursor.updatedAt),
									and(eq(playlists.updatedAt, cursor.updatedAt), lt(playlists.id, cursor.id))
								)
							: undefined
					)
				)
				.orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
