/* eslint-disable camelcase */

import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
import { z } from 'zod';

import { thumbnailGenerateSchema } from '@/modules/studio/schemas/thumbnail-generate-schema';

import { db } from '@/db';
import { MuxStatus, VideoUpdateSchema, users, videos } from '@/db/schema';
import { env as clientEnv } from '@/env/client';
import { env } from '@/env/server';
import { mux } from '@/lib/mux';
import { qstash } from '@/lib/qstash';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const videosRouter = createTRPCRouter({
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { id: userId } = ctx.user;

		const upload = await mux.video.uploads.create({
			cors_origin: clientEnv.NEXT_PUBLIC_APP_BASE_URL,
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

			const { workflowRunId } = await qstash.trigger({
				body: { userId, videoId },
				url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
			});

			return workflowRunId;
		}),
	generateThumbnail: protectedProcedure
		.input(z.object({ id: z.string().uuid(), ...thumbnailGenerateSchema.shape }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { id: videoId, prompt } = input;

			const { workflowRunId } = await qstash.trigger({
				body: { prompt, userId, videoId },
				url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
			});

			return workflowRunId;
		}),
	generateTitle: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id: videoId } = input;

		const { workflowRunId } = await qstash.trigger({
			body: { userId, videoId },
			url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
		});

		return workflowRunId;
	}),
	getOne: baseProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
		const [existingVideo] = await db
			.select({ ...getTableColumns(videos), user: getTableColumns(users) })
			.from(videos)
			.innerJoin(users, eq(videos.userId, users.id))
			.where(eq(videos.id, input.id));

		if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		return existingVideo;
	}),
	remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id } = input;

		const [removedVideo] = await db
			.delete(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)))
			.returning();

		if (!removedVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

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
