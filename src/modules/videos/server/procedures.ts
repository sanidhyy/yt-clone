/* eslint-disable camelcase */

import { cookies } from 'next/headers';

import type { Upload } from '@mux/mux-node/resources/video';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, inArray, isNotNull, lt, or } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
import { z } from 'zod';

import { OPENAI_API_KEY_COOKIE_NAME } from '@/modules/studio/constants';
import { thumbnailGenerateSchema } from '@/modules/studio/schemas/thumbnail-generate-schema';

import { db } from '@/db';
import {
	MuxStatus,
	ReactionType,
	VideoUpdateSchema,
	VideoVisibility,
	subscriptions,
	users,
	videoReactions,
	videoViews,
	videos,
} from '@/db/schema';
import { env as clientEnv } from '@/env/client';
import { env } from '@/env/server';
import { mux } from '@/lib/mux';
import { qstash } from '@/lib/qstash';
import { absoluteUrl } from '@/lib/utils';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';

import { updateVideoAsset } from './actions';

export const videosRouter = createTRPCRouter({
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { id: userId } = ctx.user;

		let upload: Upload | undefined = undefined;

		try {
			upload = await mux.video.uploads.create({
				cors_origin: absoluteUrl(''),
				new_asset_settings: {
					inputs: [
						{
							generated_subtitles: [
								{
									language_code: 'en',
									name: 'English',
								},
							],
						},
					],
					passthrough: userId,
					playback_policies: ['public'],
					static_renditions: [
						{
							resolution: 'highest',
						},
					],
				},
			});
		} catch {}

		if (!upload) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload the video!' });

		const [video] = await db
			.insert(videos)
			.values({ muxStatus: MuxStatus.WAITING, muxUploadId: upload.id, title: 'Untitled', userId })
			.returning();

		return { url: upload.url, video };
	}),
	generateDescription: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { id: videoId } = input;

			const cookieStore = await cookies();

			const openaiApiKey = cookieStore.get(OPENAI_API_KEY_COOKIE_NAME)?.value?.trim();
			if (!openaiApiKey)
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'OpenAI API key not setup! Please setup in the studio dashboard > AI settings.',
				});

			const { workflowRunId } = await qstash.trigger({
				body: { apiKey: openaiApiKey, userId, videoId },
				url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
			});

			return workflowRunId;
		}),
	generateThumbnail: protectedProcedure
		.input(z.object({ id: z.string().uuid(), ...thumbnailGenerateSchema.shape }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { id: videoId, prompt } = input;

			const cookieStore = await cookies();

			const openaiApiKey = cookieStore.get(OPENAI_API_KEY_COOKIE_NAME)?.value?.trim();
			if (!openaiApiKey)
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'OpenAI API key not setup! Please setup in the studio dashboard > AI settings.',
				});

			const { workflowRunId } = await qstash.trigger({
				body: { apiKey: openaiApiKey, prompt, userId, videoId },
				url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
			});

			return workflowRunId;
		}),
	generateTitle: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id: videoId } = input;

		const cookieStore = await cookies();

		const openaiApiKey = cookieStore.get(OPENAI_API_KEY_COOKIE_NAME)?.value?.trim();
		if (!openaiApiKey)
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'OpenAI API key not setup! Please setup in the studio dashboard > AI settings.',
			});

		const { workflowRunId } = await qstash.trigger({
			body: { apiKey: openaiApiKey, userId, videoId },
			url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
		});

		return workflowRunId;
	}),
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
				userId: z.string().uuid().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { clerkUserId } = ctx;
			const { categoryId, cursor, limit, userId } = input;

			let currentUserId: string | undefined;

			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

			if (user) currentUserId = user.id;

			const isCurrentUser = !!userId && !!currentUserId && currentUserId === userId;

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
						!isCurrentUser ? eq(videos.visibility, VideoVisibility.PUBLIC) : undefined,
						categoryId ? eq(videos.categoryId, categoryId) : undefined,
						userId ? eq(videos.userId, userId) : undefined,
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
	getManySubscribed: protectedProcedure
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

			const viewerSubscriptions = db.$with('viewer_subscriptions').as(
				db
					.select({
						userId: subscriptions.creatorId,
					})
					.from(subscriptions)
					.where(eq(subscriptions.viewerId, userId))
			);

			const data = await db
				.with(viewerSubscriptions)
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
				.innerJoin(viewerSubscriptions, eq(viewerSubscriptions.userId, users.id))
				.where(
					and(
						eq(videos.visibility, VideoVisibility.PUBLIC),
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
	getManyTrending: baseProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						viewCount: z.number(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ input }) => {
			const { cursor, limit } = input;

			const viewCountSubquery = db.$count(videoViews, eq(videoViews.videoId, videos.id));

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
					viewCount: viewCountSubquery,
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.where(
					and(
						eq(videos.visibility, VideoVisibility.PUBLIC),
						cursor
							? or(
									lt(viewCountSubquery, cursor.viewCount),
									and(eq(viewCountSubquery, cursor.viewCount), lt(videos.id, cursor.id))
								)
							: undefined
					)
				)
				.orderBy(desc(viewCountSubquery), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, viewCount: lastItem.viewCount } : null;

			return {
				items,
				nextCursor,
			};
		}),
	getOne: baseProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
		const { clerkUserId } = ctx;

		let userId: string | undefined;

		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(inArray(users.clerkId, !!clerkUserId ? [clerkUserId] : []));
		if (user) userId = user.id;

		const viewerReactions = db.$with('viewer_reaction').as(
			db
				.select({
					type: videoReactions.type,
					videoId: videoReactions.videoId,
				})
				.from(videoReactions)
				.where(inArray(videoReactions.userId, !!userId ? [userId] : []))
		);

		const viewerSubscriptions = db.$with('viewer_subscriptions').as(
			db
				.select()
				.from(subscriptions)
				.where(inArray(subscriptions.viewerId, !!userId ? [userId] : []))
		);

		const [existingVideo] = await db
			.with(viewerReactions, viewerSubscriptions)
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
				user: {
					...getTableColumns(users),
					subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
					viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
				},
				viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
				viewerReaction: viewerReactions.type,
			})
			.from(videos)
			.innerJoin(users, eq(videos.userId, users.id))
			.leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
			.leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
			.where(
				and(
					eq(videos.id, input.id),
					or(eq(videos.visibility, VideoVisibility.PUBLIC), userId ? eq(videos.userId, userId) : undefined)
				)
			);

		if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		return existingVideo;
	}),
	remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id } = input;

		const utapi = new UTApi();

		const [removedVideo] = await db
			.delete(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)))
			.returning();

		if (!removedVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		if (removedVideo.thumbnailKey) await utapi.deleteFiles(removedVideo.thumbnailKey);
		if (removedVideo.previewKey) await utapi.deleteFiles(removedVideo.previewKey);
		if (removedVideo.muxAssetId) await mux.video.assets.delete(removedVideo.muxAssetId);

		return removedVideo;
	}),
	restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id } = input;

		const utapi = new UTApi();

		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)));

		if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		if (existingVideo.thumbnailKey) {
			await utapi.deleteFiles(existingVideo.thumbnailKey);
			await db
				.update(videos)
				.set({ thumbnailKey: null, thumbnailUrl: null })
				.where(and(eq(videos.id, id), eq(videos.userId, userId)));
		}

		if (!existingVideo.muxPlaybackId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Playback id not found!' });

		const muxThumbnailUrl = `${clientEnv.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
		const uploadedThumbnail = await utapi.uploadFilesFromUrl(muxThumbnailUrl);

		if (!uploadedThumbnail.data)
			throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload thumbnail!' });

		const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data;

		const [updatedVideo] = await db
			.update(videos)
			.set({ thumbnailKey, thumbnailUrl })
			.where(and(eq(videos.id, id), eq(videos.userId, userId)))
			.returning();

		return updatedVideo;
	}),
	revalidate: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id } = input;

		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)));

		if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });
		if (!existingVideo.muxUploadId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Mux upload id not found!' });

		const updatedVideo = updateVideoAsset(existingVideo.muxUploadId);
		return updatedVideo;
	}),
	update: protectedProcedure.input(VideoUpdateSchema).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id, categoryId, description, title, visibility } = input;

		if (!id) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video id not found!' });

		const [updatedVideo] = await db
			.update(videos)
			.set({
				categoryId,
				description,
				title,
				visibility,
			})
			.where(and(eq(videos.id, id), eq(videos.userId, userId)))
			.returning();

		if (!updatedVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		return updatedVideo;
	}),
});
