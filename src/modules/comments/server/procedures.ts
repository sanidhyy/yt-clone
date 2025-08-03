import { and, desc, eq, getTableColumns, inArray, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { CommentInsertSchema, ReactionType, commentReactions, comments, users } from '@/db/schema';
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
		.query(async ({ ctx, input }) => {
			const { clerkUserId } = ctx;
			const { cursor, limit, videoId } = input;

			let userId;

			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

			if (user) userId = user.id;

			const viewerReactions = db.$with('viewer_reactions').as(
				db
					.select({
						commentId: commentReactions.commentId,
						type: commentReactions.type,
					})
					.from(commentReactions)
					.where(inArray(commentReactions.userId, userId ? [userId] : []))
			);

			const dataPromise = db
				.with(viewerReactions)
				.select({
					...getTableColumns(comments),
					dislikeCount: db.$count(
						commentReactions,
						and(eq(commentReactions.type, ReactionType.DISLIKE), eq(commentReactions.commentId, comments.id))
					),
					likeCount: db.$count(
						commentReactions,
						and(eq(commentReactions.type, ReactionType.LIKE), eq(commentReactions.commentId, comments.id))
					),
					user: users,
					viewerReaction: viewerReactions.type,
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
				.leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
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
