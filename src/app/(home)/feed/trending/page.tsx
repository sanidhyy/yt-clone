import { TrendingView } from '@/modules/home/ui/views/trending-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

const TrendingPage = async () => {
	void trpc.videos.getManyTrending.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<TrendingView />
		</HydrateClient>
	);
};

export default TrendingPage;
