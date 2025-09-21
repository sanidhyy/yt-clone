import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/trpc/routers/_app';

export type StudioGetManyOutput = inferRouterOutputs<AppRouter>['studio']['getMany'];
