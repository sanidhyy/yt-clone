'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@clerk/nextjs';
import { Trash2Icon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
			<ErrorBoundary fallback={<p>Error...</p>}>
				<PlaylistHeaderSectionSuspense playlistId={playlistId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const PlaylistHeaderSectionSuspense = ({ playlistId }: PlaylistHeaderSectionProps) => {
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

	const isPending = remove.isPending;

	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>{playlist.name}</h1>
				<p className='text-xl text-muted-foreground'>Videos from the playlist</p>
			</div>

			{/* TODO: Add confirm delete dialog */}
			{userId === playlist.user.clerkId && (
				<Button
					disabled={isPending}
					variant='outline'
					size='icon'
					className='rounded-full text-destructive hover:text-destructive/75'
					onClick={() => remove.mutate({ id: playlistId })}
				>
					<Trash2Icon />
					<span className='sr-only'>Delete playlist</span>
				</Button>
			)}
		</div>
	);
};
