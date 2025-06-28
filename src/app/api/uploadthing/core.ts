import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { z } from 'zod';

import { db } from '@/db';
import { users, videos } from '@/db/schema';

const f = createUploadthing();

export const appFileRouter = {
	thumbnailUploader: f({
		image: {
			maxFileCount: 1,
			maxFileSize: '4MB',
			minFileCount: 1,
		},
	})
		.input(z.object({ videoId: z.string().uuid() }))
		.middleware(async ({ input }) => {
			const { userId: clerkUserId } = await auth();

			if (!clerkUserId) throw new UploadThingError({ code: 'FORBIDDEN' });

			const [user] = await db.select({ id: users.id }).from(users).where(eq(users.clerkId, clerkUserId));
			if (!user) throw new UploadThingError({ code: 'FORBIDDEN' });

			return { user, ...input };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await db
				.update(videos)
				.set({ thumbnailUrl: file.ufsUrl })
				.where(and(eq(videos.id, metadata.videoId), eq(videos.userId, metadata.user.id)));

			return { uploadedBy: metadata.user.id };
		}),
} satisfies FileRouter;

export type AppFileRouter = typeof appFileRouter;
