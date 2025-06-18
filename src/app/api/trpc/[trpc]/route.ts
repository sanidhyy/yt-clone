import { type NextRequest } from 'next/server';

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		createContext: createTRPCContext,
		endpoint: '/api/trpc',
		req,
		router: appRouter,
	});

export { handler as GET, handler as POST };
