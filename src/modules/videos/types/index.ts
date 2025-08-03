import { inferRouterOutputs } from '@trpc/server';

import { AppRouter } from '@/trpc/routers/_app';

export type VideoGetOneOutput = inferRouterOutputs<AppRouter>['videos']['getOne'];
// TODO: Change to videos get many
export type VideoGetManyOutput = inferRouterOutputs<AppRouter>['suggestions']['getMany'];
