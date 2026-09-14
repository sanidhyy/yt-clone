import { cookies } from 'next/headers';

import { TRPCError } from '@trpc/server';
import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm';
import { OpenAI } from 'openai';
import { z } from 'zod';

import { AISettingsSchema } from '@/modules/studio/schemas/ai-settings-schema';

import { db } from '@/db';
import { ReactionType, comments, videoReactions, videoViews, videos } from '@/db/schema';
import { env } from '@/env/server';
import { encrypt } from '@/lib/encryption';
import { getAISettingsErrorMessage, getSecureCookieName } from '@/lib/utils';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const studioRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ ctx, input }) => {
			const { cursor, limit } = input;
			const { id: userId } = ctx.user;

			const data = await db
				.select({
					...getTableColumns(videos),
					commentCount: db.$count(comments, eq(comments.videoId, videos.id)),
					likeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.type, ReactionType.LIKE), eq(videoReactions.videoId, videos.id))
					),
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
				})
				.from(videos)
				.where(
					and(
						eq(videos.userId, userId),
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
	getOne: protectedProcedure.input(z.object({ id: z.uuid() })).query(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { id } = input;

		const [video] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, id), eq(videos.userId, userId)));

		if (!video) throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found!' });

		return video;
	}),
	removeAISettings: protectedProcedure.mutation(async () => {
		const cookieStore = await cookies();

		cookieStore.delete(getSecureCookieName(env.OPENAI_API_KEY_COOKIE_NAME));

		return { success: true };
	}),
	saveAISettings: protectedProcedure.input(AISettingsSchema).mutation(async ({ input }) => {
		const { apiKey } = input;

		const openai = new OpenAI({
			apiKey,
		});

		try {
			const completion = await openai.chat.completions.create({
				max_completion_tokens: 5,
				messages: [{ content: 'hi', role: 'user' }],
				model: 'gpt-4o-mini',
			});

			if (!completion.choices[0]?.message?.content) throw new Error('No response from API');
		} catch (error) {
			console.error(error);
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: getAISettingsErrorMessage(error),
			});
		}

		const encryptedApiKey = encrypt(apiKey);

		const cookieStore = await cookies();

		cookieStore.set(getSecureCookieName(env.OPENAI_API_KEY_COOKIE_NAME), encryptedApiKey, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 30, // 30 days
			path: '/',
			sameSite: 'lax',
			secure: env.NODE_ENV === 'production',
		});

		return { success: true };
	}),
});
