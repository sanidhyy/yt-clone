import { serve } from '@upstash/workflow/nextjs';
import { and, eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';

import { db } from '@/db';
import { videos } from '@/db/schema';
import { env } from '@/env/server';
import { decrypt } from '@/lib/encryption';

interface InputType {
	apiKey: string;
	prompt: string;
	userId: string;
	videoId: string;
}

export const { POST } = serve(async (ctx) => {
	const utapi = new UTApi();

	const input = ctx.requestPayload as InputType;
	const { apiKey, prompt, userId, videoId } = input;

	const video = await ctx.run('get-video', async () => {
		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

		if (!existingVideo) throw new Error('Video not found!');

		return existingVideo;
	});

	const { body } = await ctx.call<{ data: { url: string }[] }>('generate-thumbnail', {
		body: {
			model: 'dall-e-3',
			n: 1,
			prompt,
			size: '1792x1024',
		},
		headers: {
			authorization: `Bearer ${decrypt(apiKey)}`,
		},
		method: 'POST',
		url: `${env.OPENAI_API_BASE_URL}/images/generations`,
	});

	const generatedThumbnailUrl = body.data[0].url;
	if (!generatedThumbnailUrl) throw new Error('Failed to generate video thumbnail!');

	await ctx.run('cleanup-thumbnail', async () => {
		if (video.thumbnailKey) {
			await utapi.deleteFiles(video.thumbnailKey);
			await db
				.update(videos)
				.set({ thumbnailKey: null, thumbnailUrl: null })
				.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
		}
	});

	const uploadedThumbnail = await ctx.run('upload-thumbnail', async () => {
		const { data, error } = await utapi.uploadFilesFromUrl(generatedThumbnailUrl);

		if (!data || error) throw new Error(error.message || 'Failed to upload generated video thumbnail!');

		return data;
	});

	await ctx.run('update-video', async () => {
		await db
			.update(videos)
			.set({ thumbnailKey: uploadedThumbnail.key, thumbnailUrl: uploadedThumbnail.ufsUrl })
			.where(and(eq(videos.id, video.id), eq(videos.userId, userId)));
	});
});
