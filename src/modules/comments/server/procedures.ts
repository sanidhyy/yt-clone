import { and, desc, eq, getTableColumns, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { CommentInsertSchema, comments, users } from '@/db/schema';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const commentsRouter = createTRPCRouter({
	create: protectedProcedure.input(CommentInsertSchema.omit({ userId: true })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { videoId, value } = input;

		const [comment] = await db.insert(comments).values({ userId, value, videoId }).returning();

		return comment;
	}),
	getMany: baseProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
				videoId: z.string().uuid(),
			})
		)
		.query(async ({ input }) => {
			const { cursor, limit, videoId } = input;

			const dataPromise = db
				.select({
					user: users,
					...getTableColumns(comments),
				})
				.from(comments)
				.where(
					and(
						eq(comments.videoId, videoId),
						cursor
							? or(
									lt(comments.updatedAt, cursor.updatedAt),
									and(eq(comments.updatedAt, cursor.updatedAt), lt(comments.id, cursor.id))
								)
							: undefined
					)
				)
				.innerJoin(users, eq(comments.userId, users.id))
				.orderBy(desc(comments.updatedAt), desc(comments.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1);

			const totalCountPromise = db.$count(comments, eq(comments.videoId, videoId));

			const [data, totalCount] = await Promise.all([dataPromise, totalCountPromise]);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

			return {
				items,
				nextCursor,
				totalCount,
			};
		}),
	remove: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { id } = input;

			const [comment] = await db
				.delete(comments)
				.where(and(eq(comments.id, id), eq(comments.userId, userId)))
				.returning();

			return comment;
		}),
});
