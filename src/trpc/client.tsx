'use client';

import { useState } from 'react';

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

import { absoluteUrl } from '@/lib/utils';
import type { AppRouter } from '@/trpc/routers/_app';

import { makeQueryClient } from './query-client';

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;

function getQueryClient() {
	if (typeof window === 'undefined') {
		return makeQueryClient();
	}

	return (clientQueryClientSingleton ??= makeQueryClient());
}

export function TRPCProvider(
	props: Readonly<{
		children: React.ReactNode;
	}>
) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					headers: () => {
						const headers = new Headers();
						headers.set('x-trpc-source', 'nextjs-react');

						return headers;
					},
					transformer: superjson,
					url: absoluteUrl('/api/trpc'),
				}),
			],
		})
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
		</trpc.Provider>
	);
}
