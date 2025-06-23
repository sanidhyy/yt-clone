'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import { formatDate } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';

import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEFAULT_LIMIT } from '@/constants';
import { MuxStatus } from '@/db/schema';
import { cn, snakeCaseToTitle } from '@/lib/utils';
import { trpc } from '@/trpc/client';

export const VideosSection = () => {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<VideosSectionSuspense />
			</ErrorBoundary>
		</Suspense>
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
										<TableCell>Visibility</TableCell>
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
				isManual
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	);
};
