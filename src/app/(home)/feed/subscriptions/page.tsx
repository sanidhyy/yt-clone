import { SubscriptionsView } from '@/modules/home/ui/views/subscriptions-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

const SubscriptionsPage = async () => {
	void trpc.videos.getManySubscribed.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<SubscriptionsView />
		</HydrateClient>
	);
};

export default SubscriptionsPage;
