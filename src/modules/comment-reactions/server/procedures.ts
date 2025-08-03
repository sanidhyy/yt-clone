import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { ReactionType, commentReactions } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const commentReactionsRouter = createTRPCRouter({
	dislike: protectedProcedure.input(z.object({ commentId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { commentId } = input;

		const [existingCommentReactionDislike] = await db
			.select()
			.from(commentReactions)
			.where(
				and(
					eq(commentReactions.type, ReactionType.DISLIKE),
					eq(commentReactions.userId, userId),
					eq(commentReactions.commentId, commentId)
				)
			);

		if (existingCommentReactionDislike) {
			const [deletedCommentReaction] = await db
				.delete(commentReactions)
				.where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)))
				.returning();

			return deletedCommentReaction;
		}

		const [commentReaction] = await db
			.insert(commentReactions)
			.values({ commentId, type: ReactionType.DISLIKE, userId })
			// in case user liked comment earlier
			.onConflictDoUpdate({
				set: {
					type: ReactionType.DISLIKE,
				},
				target: [commentReactions.userId, commentReactions.commentId],
			})
			.returning();

		return commentReaction;
	}),
	like: protectedProcedure.input(z.object({ commentId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user;
		const { commentId } = input;

		const [existingCommentReactionLike] = await db
			.select()
			.from(commentReactions)
			.where(
				and(
					eq(commentReactions.type, ReactionType.LIKE),
					eq(commentReactions.userId, userId),
					eq(commentReactions.commentId, commentId)
				)
			);

		if (existingCommentReactionLike) {
			const [deletedCommentReaction] = await db
				.delete(commentReactions)
				.where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)))
				.returning();

			return deletedCommentReaction;
		}

		const [commentReaction] = await db
			.insert(commentReactions)
			.values({ commentId, type: ReactionType.LIKE, userId })
			// in case user disliked comment earlier
			.onConflictDoUpdate({
				set: {
					type: ReactionType.LIKE,
				},
				target: [commentReactions.userId, commentReactions.commentId],
			})
			.returning();

		return commentReaction;
	}),
});
