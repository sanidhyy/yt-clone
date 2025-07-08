import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

export const subscriptionsRouter = createTRPCRouter({
	create: protectedProcedure.input(z.object({ userId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { userId } = input;

		if (userId === ctx.user.id)
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot subscribe to yourself!' });

		const [subscription] = await db
			.insert(subscriptions)
			.values({ creatorId: userId, viewerId: ctx.user.id })
			.onConflictDoNothing()
			.returning();

		return subscription;
	}),
	remove: protectedProcedure.input(z.object({ userId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { userId } = input;

		if (userId === ctx.user.id)
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot unsubscribe to yourself!' });

		const [subscription] = await db
			.delete(subscriptions)
			.where(and(eq(subscriptions.viewerId, ctx.user.id), eq(subscriptions.creatorId, userId)))
			.returning();

		return subscription;
	}),
});
