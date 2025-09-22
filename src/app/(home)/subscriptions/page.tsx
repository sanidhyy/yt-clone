import { SubscriptionsView } from '@/modules/subscriptions/ui/views/subscriptions-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

const SubscriptionsPage = async () => {
	void trpc.subscriptions.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<SubscriptionsView />
		</HydrateClient>
	);
};
export default SubscriptionsPage;
