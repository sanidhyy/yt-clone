import type { inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/trpc/routers/_app';

export type StudioGetManyOutput = inferRouterOutputs<AppRouter>['studio']['getMany'];
