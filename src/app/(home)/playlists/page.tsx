import { PlaylistsView } from '@/modules/playlists/ui/views/playlists-view';

import { HydrateClient } from '@/trpc/server';

const PlaylistsPage = async () => {
	return (
		<HydrateClient>
			<PlaylistsView />
		</HydrateClient>
	);
};
export default PlaylistsPage;
