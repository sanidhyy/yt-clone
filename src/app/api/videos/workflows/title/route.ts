import { serve } from '@upstash/workflow/nextjs';
import { and, eq } from 'drizzle-orm';

import { TITLE_SYSTEM_PROMPT } from '@/constants';
import { db } from '@/db';
import { videos } from '@/db/schema';
import { env as clientEnv } from '@/env/client';
import { decrypt } from '@/lib/encryption';

interface InputType {
	apiKey: string;
	userId: string;
	videoId: string;
}

export const { POST } = serve(async (ctx) => {
	const input = ctx.requestPayload as InputType;
	const { apiKey, videoId, userId } = input;

	const video = await ctx.run('get-video', async () => {
		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

		if (!existingVideo) throw new Error('Video not found!');

		return existingVideo;
	});

	const transcript = await ctx.run('get-transcript', async () => {
		if (!video.muxPlaybackId || !video.muxTrackId) throw new Error('Mux playback id or track id not found!');
		const trackUrl = `${clientEnv.NEXT_PUBLIC_MUX_STREAM_BASE_URL}/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;

		const response = await fetch(trackUrl);
		const transcriptTxt = await response.text();

		if (!transcriptTxt) throw new Error('Transcript not found!');

		return transcriptTxt;
	});

	const { body } = await ctx.api.openai.call('generate-title', {
		body: {
			messages: [
				{
					content: TITLE_SYSTEM_PROMPT,
					role: 'system',
				},
				{
					content: transcript,
					role: 'user',
				},
			],
			model: 'gpt-4o',
		},
		operation: 'chat.completions.create',
		token: decrypt(apiKey),
	});

	const title = body.choices[0]?.message.content || video.title;

	await ctx.run('update-video', async () => {
		await db
			.update(videos)
			.set({ title })
			.where(and(eq(videos.id, video.id), eq(videos.userId, userId)));
	});
});
