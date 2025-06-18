import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { HydrateClient, trpc } from '@/trpc/server';

import { HomeClient } from './client';

const HomePage = async () => {
	void trpc.hello.prefetch({ text: 'John!' });

	return (
		<HydrateClient>
			<Suspense fallback={<div>Loading...</div>}>
				<ErrorBoundary fallback={<div>Error...</div>}>
					<HomeClient />
				</ErrorBoundary>
			</Suspense>
		</HydrateClient>
	);
};

export default HomePage;
