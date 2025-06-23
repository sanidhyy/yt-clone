'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import { ErrorBoundary } from 'react-error-boundary';

import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEFAULT_LIMIT } from '@/constants';
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
														duration={video.duration || 0}
														imageUrl={video.thumbnailUrl}
														previewUrl={video.previewUrl}
														title={video.title}
													/>
												</div>
											</div>
										</TableCell>
										<TableCell>Visibility</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Date</TableCell>
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
