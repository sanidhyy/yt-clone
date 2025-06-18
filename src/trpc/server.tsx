import 'server-only';

import { cache } from 'react';

import { createHydrationHelpers } from '@trpc/react-query/rsc';

import { appRouter } from '@/trpc/routers/_app';

import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';

export const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)(createTRPCContext);

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(caller, getQueryClient);
