import { useEffect, useMemo, useState } from 'react';

import { useClerk } from '@clerk/nextjs';
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { VideoGetOneOutput } from '@/modules/videos/types';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ReactionType } from '@/db/schema';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface VideoReactionsProps {
	dislikes: number;
	likes: number;
	videoId: string;
	viewerReaction: VideoGetOneOutput['viewerReaction'];
}

interface OptimisticState {
	likes: number;
	dislikes: number;
	viewerReaction: VideoGetOneOutput['viewerReaction'];
	hasOptimisticUpdate: boolean;
}

export const VideoReactions = ({ dislikes, likes, videoId, viewerReaction }: VideoReactionsProps) => {
	const clerk = useClerk();
	const utils = trpc.useUtils();

	// Local optimistic state
	const [optimisticState, setOptimisticState] = useState<OptimisticState>({
		dislikes,
		hasOptimisticUpdate: false,
		likes,
		viewerReaction,
	});

	// Sync with server state only when no optimistic updates are pending
	useEffect(() => {
		// Only sync if there's no pending optimistic update
		// And the incoming props are different from the current optimistic state
		if (
			!optimisticState.hasOptimisticUpdate &&
			(optimisticState.likes !== likes ||
				optimisticState.dislikes !== dislikes ||
				optimisticState.viewerReaction !== viewerReaction)
		) {
			setOptimisticState({
				dislikes,
				hasOptimisticUpdate: false,
				likes,
				viewerReaction,
			});
		}
	}, [
		likes,
		dislikes,
		viewerReaction,
		optimisticState.hasOptimisticUpdate,
		optimisticState.likes,
		optimisticState.dislikes,
		optimisticState.viewerReaction,
	]);

	const compactLikes = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(optimisticState.likes);
	}, [optimisticState.likes]);

	const compactDislikes = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(optimisticState.dislikes);
	}, [optimisticState.dislikes]);

	const like = trpc.videoReactions.like.useMutation({
		onError: (error) => {
			// Revert optimistic update on error
			setOptimisticState({
				dislikes,
				hasOptimisticUpdate: false,
				likes,
				viewerReaction,
			});

			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to like this video!');
			}
		},
		onSuccess: () => {
			// ONLY invalidate the query.
			// The useEffect will handle syncing the state once new props arrive.
			utils.videos.getOne.invalidate({ id: videoId });
			// TODO: Invalidate "liked" playlists
		},
	});

	const dislike = trpc.videoReactions.dislike.useMutation({
		onError: (error) => {
			// Revert optimistic update on error
			setOptimisticState({
				dislikes,
				hasOptimisticUpdate: false,
				likes,
				viewerReaction,
			});

			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to dislike this video!');
			}
		},
		onSuccess: () => {
			// ONLY invalidate the query.
			// The useEffect will handle syncing the state once new props arrive.
			utils.videos.getOne.invalidate({ id: videoId });
			// TODO: Invalidate "liked" playlists
		},
	});

	const handleLike = () => {
		setOptimisticState((prevState) => {
			// If already liked, remove like
			if (prevState.viewerReaction === ReactionType.LIKE) {
				return {
					dislikes: prevState.dislikes,
					hasOptimisticUpdate: true,
					likes: prevState.likes - 1,
					viewerReaction: null,
				};
			}
			// If disliked, remove dislike and add like
			if (prevState.viewerReaction === ReactionType.DISLIKE) {
				return {
					dislikes: prevState.dislikes - 1,
					hasOptimisticUpdate: true,
					likes: prevState.likes + 1,
					viewerReaction: ReactionType.LIKE,
				};
			}
			// If no reaction, add like
			return {
				dislikes: prevState.dislikes,
				hasOptimisticUpdate: true,
				likes: prevState.likes + 1,
				viewerReaction: ReactionType.LIKE,
			};
		});

		like.mutate({ videoId });
	};

	const handleDislike = () => {
		setOptimisticState((prevState) => {
			// If already disliked, remove dislike
			if (prevState.viewerReaction === ReactionType.DISLIKE) {
				return {
					dislikes: prevState.dislikes - 1,
					hasOptimisticUpdate: true,
					likes: prevState.likes,
					viewerReaction: null,
				};
			}
			// If liked, remove like and add dislike
			if (prevState.viewerReaction === ReactionType.LIKE) {
				return {
					dislikes: prevState.dislikes + 1,
					hasOptimisticUpdate: true,
					likes: prevState.likes - 1,
					viewerReaction: ReactionType.DISLIKE,
				};
			}
			// If no reaction, add dislike
			return {
				dislikes: prevState.dislikes + 1,
				hasOptimisticUpdate: true,
				likes: prevState.likes,
				viewerReaction: ReactionType.DISLIKE,
			};
		});

		dislike.mutate({ videoId });
	};

	const isMutationPending = like.isPending || dislike.isPending;

	return (
		<div className='flex flex-none items-center'>
			<Button
				onClick={handleLike}
				disabled={isMutationPending || !clerk.loaded}
				className='gap-2 rounded-l-full rounded-r-none pr-4 hover:bg-gray-200 disabled:opacity-100'
				variant='secondary'
			>
				<ThumbsUpIcon className={cn('size-5', optimisticState.viewerReaction === ReactionType.LIKE && 'fill-black')} />
				{compactLikes}
				<span className='sr-only'>Like{likes === 1 ? '' : 's'}</span>
			</Button>

			<Separator orientation='vertical' className='h-7' />

			<Button
				onClick={handleDislike}
				disabled={isMutationPending || !clerk.loaded}
				className='rounded-l-none rounded-r-full pl-3 hover:bg-gray-200 disabled:opacity-100'
				variant='secondary'
			>
				<ThumbsDownIcon
					className={cn('size-5', optimisticState.viewerReaction === ReactionType.DISLIKE && 'fill-black')}
				/>
				{compactDislikes}
				<span className='sr-only'>Dislike{dislikes === 1 ? '' : 's'}</span>
			</Button>
		</div>
	);
};
