import { useEffect, useMemo, useState } from 'react';

import { useClerk } from '@clerk/nextjs';
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import type { CommentsGetManyOutput } from '@/modules/comments/types';

import { Button } from '@/components/ui/button';
import { ReactionType } from '@/db/schema';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface CommentReactionsProps {
	commentId: string;
	dislikes: number;
	likes: number;
	videoId: string;
	viewerReaction: CommentsGetManyOutput['items'][number]['viewerReaction'];
}

interface OptimisticState {
	likes: number;
	dislikes: number;
	viewerReaction: CommentsGetManyOutput['items'][number]['viewerReaction'];
	hasOptimisticUpdate: boolean;
}

export const CommentReactions = ({ commentId, dislikes, likes, videoId, viewerReaction }: CommentReactionsProps) => {
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

	const like = trpc.commentReactions.like.useMutation({
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
				toast.error(error.message || 'Failed to like this comment!');
			}
		},
		onSuccess: () => {
			// ONLY invalidate the query.
			// The useEffect will handle syncing the state once new props arrive.
			utils.comments.getMany.invalidate({ videoId });
		},
	});

	const dislike = trpc.commentReactions.dislike.useMutation({
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
				toast.error(error.message || 'Failed to dislike this comment!');
			}
		},
		onSuccess: () => {
			// ONLY invalidate the query.
			// The useEffect will handle syncing the state once new props arrive.
			utils.comments.getMany.invalidate({ videoId });
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

		like.mutate({ commentId });
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

		dislike.mutate({ commentId });
	};

	const isMutationPending = like.isPending || dislike.isPending;

	return (
		<div className='flex items-center'>
			<Button
				onClick={handleLike}
				disabled={isMutationPending || !clerk.loaded}
				size='icon'
				variant='ghost'
				className='size-8 disabled:opacity-100'
			>
				<ThumbsUpIcon className={cn(optimisticState.viewerReaction === ReactionType.LIKE && 'fill-black')} />
				<span className='sr-only'>Like</span>
			</Button>
			<span className='text-xs text-muted-foreground'>{compactLikes}</span>

			<Button
				onClick={handleDislike}
				disabled={isMutationPending || !clerk.loaded}
				size='icon'
				variant='ghost'
				className='size-8 disabled:opacity-100'
			>
				<ThumbsDownIcon className={cn(optimisticState.viewerReaction === ReactionType.DISLIKE && 'fill-black')} />
				<span className='sr-only'>Dislike</span>
			</Button>
			<span className='text-xs text-muted-foreground'>{compactDislikes}</span>
		</div>
	);
};
