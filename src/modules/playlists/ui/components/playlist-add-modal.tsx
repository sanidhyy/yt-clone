import { Loader2Icon, SquareCheckIcon, SquareIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

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

	const addVideo = trpc.playlists.addVideo.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to add video to playlist!');
		},
		onSuccess: () => {
			toast.success('Video added to playlist!');
			utils.playlists.getMany.invalidate();
			utils.playlists.getManyForVideo.invalidate({ videoId });
			// TODO: Invalidate playlist get one
		},
	});

	const removeVideo = trpc.playlists.removeVideo.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to remove video from playlist!');
		},
		onSuccess: () => {
			toast.success('Video removed from playlist!');
			utils.playlists.getMany.invalidate();
			utils.playlists.getManyForVideo.invalidate({ videoId });
			// TODO: Invalidate playlist get one
		},
	});

	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) utils.playlists.getManyForVideo.refetch();

		onOpenChange(newOpen);
	};

	const isPending = addVideo.isPending || removeVideo.isPending;

	return (
		<ResponsiveModal
			title='Addd to playlist'
			description='Add new video to an existing playlist.'
			open={open || isPending}
			onOpenChange={handleOpenChange}
		>
			<div className='flex flex-col gap-2'>
				{isLoading && (
					<div className='flex justify-center p-4'>
						<Loader2Icon className='size-5 animate-spin text-muted-foreground' />
					</div>
				)}

				{!isLoading &&
					playlists?.pages
						.flatMap((page) => page.items)
						.map((playlist) => (
							<Button
								disabled={isPending}
								key={playlist.id}
								variant='ghost'
								className='w-full justify-start px-2 [&_svg]:size-5'
								size='lg'
								onClick={() => {
									if (playlist.containsVideo) {
										removeVideo.mutate({ playlistId: playlist.id, videoId });
									} else {
										addVideo.mutate({ playlistId: playlist.id, videoId });
									}
								}}
							>
								{playlist.containsVideo ? <SquareCheckIcon className='mr-2' /> : <SquareIcon className='mr-2' />}
								{playlist.name}
							</Button>
						))}

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
