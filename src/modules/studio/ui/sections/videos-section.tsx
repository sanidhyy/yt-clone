'use client';

import { Suspense } from 'react';

import { TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { VideosSectionRow } from '@/modules/studio/ui/components/videos-section-row';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

export const VideosSection = () => {
	return (
		<Suspense fallback={<VideosSectionSkeleton />}>
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch videos!
					</p>
				}
			>
				<VideosSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideosSectionSkeleton = () => {
	return (
		<div className='border-y'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className='w-[510px] pl-6'>Video</TableHead>
						<TableHead>Visibility</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Date</TableHead>
						<TableHead className='text-right'>Views</TableHead>
						<TableHead className='text-right'>Comments</TableHead>
						<TableHead className='pr-6 text-right'>Likes</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{Array.from({ length: 5 }).map((_, index) => (
						<TableRow key={index}>
							<TableCell className='w-[510px] pl-6'>
								<div className='flex items-center gap-4'>
									<Skeleton className='h-20 w-36' />
									<div className='flex flex-col gap-2'>
										<Skeleton className='h-4 w-[100px]' />
										<Skeleton className='h-3 w-[150px]' />
									</div>
								</div>
							</TableCell>

							<TableCell>
								<Skeleton className='h-4 w-20' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-4 w-16' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-4 w-24' />
							</TableCell>
							<TableCell className='text-right'>
								<Skeleton className='ml-auto h-4 w-12' />
							</TableCell>
							<TableCell className='text-right'>
								<Skeleton className='ml-auto h-4 w-12' />
							</TableCell>
							<TableCell className='pr-6 text-right'>
								<Skeleton className='ml-auto h-4 w-12' />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

const VideosSectionSuspense = () => {
	const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{ limit: DEFAULT_LIMIT },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return (
		<>
			<div className='border-y'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[510px] pl-6'>Video</TableHead>
							<TableHead>Visibility</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
							<TableHead className='text-right'>Views</TableHead>
							<TableHead className='text-right'>Comments</TableHead>
							<TableHead className='pr-6 text-right'>Likes</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{videos.pages
							.flatMap((page) => page.items)
							.map((video) => (
								<VideosSectionRow key={video.id} video={video} />
							))}
					</TableBody>
				</Table>
			</div>

			<InfiniteScroll
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</>
	);
};
