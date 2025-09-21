import { PlaylistHeaderSection } from '@/modules/playlists/ui/sections/playlist-header-section';
import { VideosSection } from '@/modules/playlists/ui/sections/videos-section';

interface VideosViewProps {
	playlistId: string;
}

export const VideosView = ({ playlistId }: VideosViewProps) => {
	return (
		<div className='mx-auto mb-10 flex max-w-screen-md flex-col gap-y-6 px-4 pt-2.5'>
			<PlaylistHeaderSection playlistId={playlistId} />
			<VideosSection playlistId={playlistId} />
		</div>
	);
};
