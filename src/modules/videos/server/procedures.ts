/* eslint-disable camelcase */

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
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
