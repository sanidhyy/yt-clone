'use client';

import { Suspense } from 'react';

import { ErrorBoundary } from 'react-error-boundary';

import { CommentForm } from '@/modules/comments/ui/components/comment-form';
import { CommentItem } from '@/modules/comments/ui/components/comment-item';

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
	const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });

	return (
		<div className='mt-6'>
			<div className='flex flex-col gap-6'>
				<h1>0 Comments</h1>

				<CommentForm videoId={videoId} />

				<div className='mt-2 flex flex-col gap-4'>
					{comments.map((comment) => (
						<CommentItem key={comment.id} comment={comment} />
					))}
				</div>
			</div>
		</div>
	);
};
