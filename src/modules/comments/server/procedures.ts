import { eq, getTableColumns } from 'drizzle-orm';
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
	getMany: baseProcedure.input(z.object({ videoId: z.string().uuid() })).query(async ({ input }) => {
		const { videoId } = input;

		const data = await db
			.select({
				user: users,
				...getTableColumns(comments),
			})
			.from(comments)
			.where(eq(comments.videoId, videoId))
			.innerJoin(users, eq(comments.userId, users.id));

		return data;
	}),
});
