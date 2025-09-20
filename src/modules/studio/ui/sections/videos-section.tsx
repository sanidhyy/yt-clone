'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import { formatDate } from 'date-fns';
import { Globe2Icon, LockIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEFAULT_LIMIT } from '@/constants';
import { MuxStatus, VideoVisibility } from '@/db/schema';
import { cn, snakeCaseToTitle } from '@/lib/utils';
import { trpc } from '@/trpc/client';

export const VideosSection = () => {
	return (
		<Suspense fallback={<VideosSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<VideosSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideosSectionSkeleton = () => {
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
		</>
	);
};

const VideosSectionSuspense = () => {
	const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{ limit: DEFAULT_LIMIT },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return (
		<div>
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
								<Link href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
									<TableRow className='cursor-pointer'>
										<TableCell className='w-[510px] pl-6'>
											<div className='flex items-center gap-4'>
												<div className='relative aspect-video w-36 shrink-0'>
													<VideoThumbnail
														duration={video.duration}
														imageUrl={video.thumbnailUrl}
														previewUrl={video.previewUrl}
														title={video.title}
													/>
												</div>

												<div className='flex flex-col gap-y-1 overflow-hidden'>
													<span className='line-clamp-1 text-sm'>{video.title}</span>
													<span
														className={cn(
															'line-clamp-1 text-xs text-muted-foreground',
															!video.description?.trim() && 'italic'
														)}
													>
														{video.description || 'No description'}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center'>
												{video.visibility === VideoVisibility.PRIVATE ? (
													<LockIcon className='mr-2 size-4' />
												) : (
													<Globe2Icon className='mr-2 size-4' />
												)}
												{snakeCaseToTitle(video.visibility)}
											</div>
										</TableCell>
										<TableCell>
											<div className='flex items-center'>{snakeCaseToTitle(video.muxStatus || MuxStatus.ERRORED)}</div>
										</TableCell>
										<TableCell className='truncate text-sm'>
											{formatDate(new Date(video.createdAt), 'd MMM yyyy')}
										</TableCell>
										<TableCell className='text-right'>Views</TableCell>
										<TableCell className='text-right'>Comments</TableCell>
										<TableCell className='pr-6 text-right'>Likes</TableCell>
									</TableRow>
								</Link>
							))}
					</TableBody>
				</Table>
			</div>

			<InfiniteScroll
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	);
};
