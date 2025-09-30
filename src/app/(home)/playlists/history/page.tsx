import { HistoryView } from '@/modules/playlists/ui/views/history-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

const HistoryPage = () => {
	void trpc.playlists.getHistory.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<HistoryView />
		</HydrateClient>
	);
};

export default HistoryPage;
