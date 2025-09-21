import { categoriesRouter } from '@/modules/categories/server/procedures';
import { commentReactionsRouter } from '@/modules/comment-reactions/server/procedures';
import { commentsRouter } from '@/modules/comments/server/procedures';
import { playlistsRouter } from '@/modules/playlists/server/procedures';
import { searchRouter } from '@/modules/search/server/procedures';
import { studioRouter } from '@/modules/studio/server/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedures';
import { suggestionsRouter } from '@/modules/suggestions/server/procedures';
import { usersRouter } from '@/modules/users/server/procedures';
import { videoReactionsRouter } from '@/modules/video-reactions/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';

import { createTRPCRouter } from '@/trpc/init';

export const appRouter = createTRPCRouter({
	categories: categoriesRouter,
	commentReactions: commentReactionsRouter,
	comments: commentsRouter,
	playlists: playlistsRouter,
	search: searchRouter,
	studio: studioRouter,
	subscriptions: subscriptionsRouter,
	suggestions: suggestionsRouter,
	users: usersRouter,
	videoReactions: videoReactionsRouter,
	videoViews: videoViewsRouter,
	videos: videosRouter,
});

export type AppRouter = typeof appRouter;
