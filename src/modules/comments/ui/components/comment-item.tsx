import { useMemo, useState } from 'react';
import Link from 'next/link';

import { useAuth, useClerk } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon, MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';

import { CommentReactions } from '@/modules/comment-reactions/ui/components/comment-reactions';
import type { CommentsGetManyOutput } from '@/modules/comments/types';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/user-avatar';
import { useConfirm } from '@/hooks/use-confirm';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

import { CommentForm } from './comment-form';
import { CommentReplies } from './comment-replies';

interface CommentItemProps {
	comment: CommentsGetManyOutput['items'][number];
	variant?: 'reply' | 'comment';
}

export const CommentItem = ({ comment, variant = 'comment' }: CommentItemProps) => {
	const isReply = variant === 'reply';

	const utils = trpc.useUtils();
	const { userId } = useAuth();
	const clerk = useClerk();
	const [ConfirmDialog, confirm] = useConfirm({
		message: `Are you sure you want to delete this ${isReply ? 'reply' : 'comment'}? This action cannot be undone.`,
		title: `Delete ${isReply ? 'reply' : 'comment'}`,
	});

	const [isReplyOpen, setIsReplyOpen] = useState(false);
	const [isRepliesOpen, setIsRepliesOpen] = useState(false);

	const remove = trpc.comments.remove.useMutation({
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to add comment to the video!');
			}
		},
		onSuccess: () => {
			toast.success('Comment deleted!');
			utils.comments.getMany.invalidate({ videoId: comment.videoId });
		},
	});

	const handleRemove = async () => {
		const ok = await confirm();

		if (!ok) return;

		remove.mutate({ id: comment.id });
	};

	const compactReplyCount = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(comment.replyCount);
	}, [comment.replyCount]);

	return (
		<div>
			<ConfirmDialog />

			<div className={cn('flex gap-4', isReply && 'gap-2')}>
				<Link prefetch href={`/users/${comment.userId}`}>
					<UserAvatar size={isReply ? 'sm' : 'lg'} imageUrl={comment.user.imageUrl} name={comment.user.name} />
				</Link>

				<div className='min-w-0 flex-1'>
					<Link prefetch href={`/users/${comment.userId}`}>
						<div className='mb-0.5 flex items-center gap-2'>
							<span className='pb-0.5 text-sm font-medium'>{comment.user.name}</span>
							<span className='text-xs text-muted-foreground'>
								{formatDistanceToNow(comment.updatedAt, {
									addSuffix: true,
								})}
							</span>
						</div>
					</Link>

					<p className='text-sm'>{comment.value}</p>

					<div className='mt-1 flex items-center gap-2'>
						<CommentReactions
							commentId={comment.id}
							dislikes={comment.dislikeCount}
							likes={comment.likeCount}
							videoId={comment.videoId}
							viewerReaction={comment.viewerReaction}
						/>

						{!isReply && (
							<Button variant='ghost' size='sm' className='h-8' onClick={() => setIsReplyOpen(true)}>
								Reply
							</Button>
						)}
					</div>
				</div>

				{(comment.user.clerkId === userId || !isReply) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon' className='size-8'>
								<MoreVerticalIcon />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end'>
							{!isReply && (
								<DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
									<MessageSquareIcon className='size-4' />
									Reply
								</DropdownMenuItem>
							)}

							{comment.user.clerkId === userId && (
								<DropdownMenuItem onClick={handleRemove} variant='destructive'>
									<Trash2Icon className='size-4' />
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{isReplyOpen && !isReply && (
				<div className='mt-4 pl-14'>
					<CommentForm
						variant='reply'
						parentId={comment.id}
						videoId={comment.videoId}
						onCancel={() => setIsReplyOpen(false)}
						onSuccess={() => {
							setIsReplyOpen(false);
							setIsRepliesOpen(true);
						}}
					/>
				</div>
			)}

			{comment.replyCount > 0 && !isReply && (
				<div className='pl-14'>
					<Button variant='tertiary' size='sm' onClick={() => setIsRepliesOpen((isRepliesOpen) => !isRepliesOpen)}>
						{isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />} {compactReplyCount}{' '}
						{comment.replyCount === 1 ? 'reply' : 'replies'}
					</Button>
				</div>
			)}

			{comment.replyCount > 0 && !isReply && isRepliesOpen && (
				<CommentReplies parentId={comment.id} videoId={comment.videoId} />
			)}
		</div>
	);
};
