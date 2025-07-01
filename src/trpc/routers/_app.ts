import { categoriesRouter } from '@/modules/categories/server/procedures';
import { studioRouter } from '@/modules/studio/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';

import { createTRPCRouter } from '@/trpc/init';

export const appRouter = createTRPCRouter({
	categories: categoriesRouter,
	studio: studioRouter,
	videoViews: videoViewsRouter,
	videos: videosRouter,
});

export type AppRouter = typeof appRouter;
