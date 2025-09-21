import { Loader2Icon } from 'lucide-react';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { ResponsiveModal } from '@/components/responsive-modal';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

import { PlaylistAddButton } from './playlist-add-button';

interface PlaylistAddModalProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	videoId: string;
}

export const PlaylistAddModal = ({ onOpenChange, open, videoId }: PlaylistAddModalProps) => {
	const utils = trpc.useUtils();

	const {
		data: playlists,
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = trpc.playlists.getManyForVideo.useInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
			videoId,
		},
		{
			enabled: !!videoId && open,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) utils.playlists.getManyForVideo.refetch();

		onOpenChange(newOpen);
	};

	return (
		<ResponsiveModal
			title='Add to playlist'
			description='Add new video to an existing playlist.'
			open={open}
			onOpenChange={handleOpenChange}
		>
			<div className='flex flex-col gap-2'>
				{isLoading && (
					<div className='flex justify-center p-4'>
						<Loader2Icon className='size-5 animate-spin text-muted-foreground' />
					</div>
				)}

				{!isLoading && !playlists?.pages[0].items.length && (
					<p className='mt-4 text-center text-sm text-muted-foreground'>No playlists yet.</p>
				)}

				{!isLoading &&
					playlists?.pages
						.flatMap((page) => page.items)
						.map((playlist) => <PlaylistAddButton key={playlist.id} playlist={playlist} videoId={videoId} />)}

				{!isLoading && (
					<InfiniteScroll
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						fetchNextPage={fetchNextPage}
						isManual
					/>
				)}
			</div>
		</ResponsiveModal>
	);
};
