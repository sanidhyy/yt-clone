import { TRPCError } from '@trpc/server';
import { eq, getTableColumns, inArray, isNotNull } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { subscriptions, users, videos } from '@/db/schema';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';

export const usersRouter = createTRPCRouter({
	getOne: baseProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
		const { clerkUserId } = ctx;

		let userId: string | undefined;

		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(inArray(users.clerkId, !!clerkUserId ? [clerkUserId] : []));
		if (user) userId = user.id;

		const viewerSubscriptions = db.$with('viewer_subscriptions').as(
			db
				.select()
				.from(subscriptions)
				.where(inArray(subscriptions.viewerId, !!userId ? [userId] : []))
		);

		const [existingUser] = await db
			.with(viewerSubscriptions)
			.select({
				...getTableColumns(users),
				subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
				videoCount: db.$count(videos, eq(videos.userId, users.id)),
				viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
			})
			.from(users)
			.leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
			.where(eq(users.id, input.id));

		if (!existingUser) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found!' });

		return existingUser;
	}),
});
