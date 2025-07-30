'use client';

import { Suspense } from 'react';

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
		<Suspense fallback={<p>Loading...</p>}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<CommentsSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
	const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
		{ limit: DEFAULT_LIMIT, videoId },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return (
		<div className='mt-6'>
			<div className='flex flex-col gap-6'>
				<h1 className='text-xl font-bold'>{comments.pages?.[0]?.totalCount || 0} Comments</h1>

				<CommentForm videoId={videoId} />

				<div className='mt-2 flex flex-col gap-4'>
					{comments.pages
						.flatMap((page) => page.items)
						.map((comment) => (
							<CommentItem key={comment.id} comment={comment} />
						))}

					<InfiniteScroll
						isManual
						hasNextPage={query.hasNextPage}
						isFetchingNextPage={query.isFetchingNextPage}
						fetchNextPage={query.fetchNextPage}
					/>
				</div>
			</div>
		</div>
	);
};
