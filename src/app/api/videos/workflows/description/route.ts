import { serve } from '@upstash/workflow/nextjs';
import { and, eq } from 'drizzle-orm';

import { DESCRIPTION_SYSTEM_PROMPT } from '@/constants';
import { db } from '@/db';
import { videos } from '@/db/schema';
import { env as clientEnv } from '@/env/client';
import { env } from '@/env/server';

interface InputType {
	userId: string;
	videoId: string;
}

export const { POST } = serve(async (ctx) => {
	const input = ctx.requestPayload as InputType;
	const { videoId, userId } = input;

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

	const { body } = await ctx.api.openai.call('generate-description', {
		body: {
			messages: [
				{
					content: DESCRIPTION_SYSTEM_PROMPT,
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
		token: env.OPENAI_API_KEY,
	});

	const description = body.choices[0]?.message.content || video.description;

	await ctx.run('update-video', async () => {
		await db
			.update(videos)
			.set({ description })
			.where(and(eq(videos.id, video.id), eq(videos.userId, userId)));
	});
});
