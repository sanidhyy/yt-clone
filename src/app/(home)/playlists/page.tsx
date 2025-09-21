import { PlaylistsView } from '@/modules/playlists/ui/views/playlists-view';

import { DEFAULT_LIMIT } from '@/constants';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

const PlaylistsPage = async () => {
	void trpc.playlists.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<HydrateClient>
			<PlaylistsView />
		</HydrateClient>
	);
};
export default PlaylistsPage;
