/* eslint-disable camelcase */

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
import { z } from 'zod';

import { db } from '@/db';
import { MuxStatus, VideoUpdateSchema, videos } from '@/db/schema';
import { env } from '@/env/client';
import { mux } from '@/lib/mux';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const videosRouter = createTRPCRouter({
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { id: userId } = ctx.user;

		const upload = await mux.video.uploads.create({
			cors_origin: env.NEXT_PUBLIC_APP_BASE_URL,
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

		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)));

		if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		if (existingVideo.thumbnailKey) {
			const utapi = new UTApi();

			await utapi.deleteFiles(existingVideo.thumbnailKey);
			await db
				.update(videos)
				.set({ thumbnailKey: null, thumbnailUrl: null })
				.where(and(eq(videos.id, id), eq(videos.userId, userId)));
		}

		if (!existingVideo.muxPlaybackId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Playback id not found!' });

		const thumbnailUrl = `${env.NEXT_PUBLIC_MUX_IMAGE_BASE_URL}/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

		const [updatedVideo] = await db
			.update(videos)
			.set({ thumbnailUrl })
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
