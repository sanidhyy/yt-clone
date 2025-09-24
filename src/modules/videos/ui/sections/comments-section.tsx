'use client';

import { Suspense } from 'react';

import { Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { CommentForm } from '@/modules/comments/ui/components/comment-form';
import { CommentItem } from '@/modules/comments/ui/components/comment-item';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface CommentsSectionProps {
	videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
	return (
		<Suspense fallback={<CommentsSectionSkeleton />}>
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch comments!
					</p>
				}
			>
				<CommentsSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const CommentsSectionSkeleton = () => {
	return (
		<div className='mt-6 flex items-center justify-center'>
			<Loader2Icon
				className='size-7 animate-spin text-muted-foreground'
				aria-label='Loading comments...'
				strokeWidth={2.5}
			/>
		</div>
	);
};

const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
	const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
		{ limit: DEFAULT_LIMIT, videoId },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	const totalCount = comments.pages?.[0]?.totalCount || 0;

	return (
		<div className='mt-6'>
			<div className='flex flex-col gap-6'>
				<h1 className='text-xl font-bold'>
					{totalCount} Comment{totalCount === 1 ? '' : 's'}
				</h1>

				<CommentForm videoId={videoId} />

				<div className='mt-2 flex flex-col gap-4'>
					{comments.pages
						.flatMap((page) => page.items)
						.map((comment) => (
							<CommentItem key={comment.id} comment={comment} />
						))}

					<InfiniteScroll
						hasNextPage={query.hasNextPage}
						isFetchingNextPage={query.isFetchingNextPage}
						fetchNextPage={query.fetchNextPage}
					/>
				</div>
			</div>
		</div>
	);
};
