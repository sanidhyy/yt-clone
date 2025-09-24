'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@clerk/nextjs';
import { ShareIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirm } from '@/hooks/use-confirm';
import { absoluteUrl } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface PlaylistHeaderSectionProps {
	playlistId: string;
}

const PlaylistHeaderSectionSkeleton = () => {
	return (
		<div className='flex flex-col gap-y-2'>
			<Skeleton className='h-6 w-24' />
			<Skeleton className='h-4 w-32' />
		</div>
	);
};

export const PlaylistHeaderSection = ({ playlistId }: PlaylistHeaderSectionProps) => {
	return (
		<Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch playlist!
					</p>
				}
			>
				<PlaylistHeaderSectionSuspense playlistId={playlistId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const PlaylistHeaderSectionSuspense = ({ playlistId }: PlaylistHeaderSectionProps) => {
	const [ConfirmDialog, confirm] = useConfirm({
		message: 'Are you sure you want to delete this playlist? This action cannot be undone.',
		title: 'Delete playlist',
	});

	const utils = trpc.useUtils();
	const router = useRouter();
	const { userId } = useAuth();

	const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

	const remove = trpc.playlists.remove.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to remove playlist!');
		},
		onSuccess: () => {
			toast.success('Playlist removed!');

			utils.playlists.getMany.invalidate();

			router.push('/playlists');
		},
	});

	const handleRemove = async () => {
		const ok = await confirm();

		if (!ok) return;

		remove.mutate({ id: playlistId });
	};

	const fullUrl = absoluteUrl(`/playlists/${playlistId}`);

	const handleSharePlaylist = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);

			toast.success('Link copied to the copied!');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to copy video url!');
		}
	};

	const isPending = remove.isPending;

	return (
		<>
			<ConfirmDialog />

			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>{playlist.name}</h1>
					<p className='text-xl text-muted-foreground'>Videos from the playlist</p>
				</div>

				<div className='flex items-center gap-2'>
					{userId === playlist.user.clerkId && (
						<Button
							disabled={isPending}
							variant='outline'
							size='icon'
							className='rounded-full text-destructive hover:text-destructive/75'
							onClick={handleRemove}
						>
							<Trash2Icon />
							<span className='sr-only'>Delete playlist</span>
						</Button>
					)}

					<Button
						disabled={isPending}
						variant='outline'
						size='icon'
						className='rounded-full'
						onClick={handleSharePlaylist}
					>
						<ShareIcon />
						<span className='sr-only'>Share playlist</span>
					</Button>
				</div>
			</div>
		</>
	);
};
