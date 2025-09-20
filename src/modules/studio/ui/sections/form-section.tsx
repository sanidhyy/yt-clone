'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	CheckCircle2Icon,
	CopyCheckIcon,
	CopyIcon,
	Globe2Icon,
	ImagePlusIcon,
	Loader2Icon,
	LockIcon,
	MoreVerticalIcon,
	RefreshCwIcon,
	RotateCcwIcon,
	SparklesIcon,
	Trash2Icon,
} from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';

import { ThumbnailGenerateModal } from '@/modules/studio/ui/components/thumbnail-generate-modal';
import { ThumbnailUploadModal } from '@/modules/studio/ui/components/thumbnail-upload-modal';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { MuxStatus, VideoUpdateSchema, VideoVisibility } from '@/db/schema';
import { absoluteUrl, cn, snakeCaseToTitle } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface FormSectionProps {
	videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
	return (
		<Suspense fallback={<FormSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<FormSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const FormSectionSkeleton = () => {
	return (
		<div>
			<div className='mb-6 flex items-center justify-between'>
				<div className='space-y-2'>
					<Skeleton className='h-7 w-32' />
					<Skeleton className='h-4 w-40' />
				</div>

				<div className='flex items-center gap-x-2'>
					<Skeleton className='h-9 w-16' />
					<Skeleton className='h-9 w-8' />
					<Skeleton className='h-9 w-8' />
				</div>
			</div>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
				<div className='space-y-8 lg:col-span-3'>
					<div className='space-y-2'>
						<Skeleton className='h-5 w-16' />
						<Skeleton className='h-10 w-full' />
					</div>

					<div className='space-y-2'>
						<Skeleton className='h-5 w-24' />
						<Skeleton className='h-[220px] w-full' />
					</div>

					<div className='space-y-2'>
						<Skeleton className='h-5 w-20' />
						<Skeleton className='h-[84px] w-[153px]' />
					</div>

					<div className='space-y-2'>
						<Skeleton className='h-5 w-20' />
						<Skeleton className='h-10 w-full' />
					</div>
				</div>

				<div className='flex flex-col gap-y-8 lg:col-span-2'>
					<div className='flex flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]'>
						<Skeleton className='aspect-video' />

						<div className='space-y-6 p-4'>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-20' />
								<Skeleton className='h-5 w-full' />
							</div>

							<div className='space-y-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-5 w-32' />
							</div>

							<div className='space-y-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-5 w-32' />
							</div>
						</div>
					</div>

					<div className='space-y-2'>
						<Skeleton className='h-5 w-20' />
						<Skeleton className='h-10 w-full' />
					</div>
				</div>
			</div>
		</div>
	);
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
	const router = useRouter();
	const utils = trpc.useUtils();

	const [isCopied, setIsCopied] = useState(false);
	const [thumbnailUploadModalOpen, setThumbnailUploadModalOpen] = useState(false);
	const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] = useState(false);

	const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
	const [categories] = trpc.categories.getMany.useSuspenseQuery();

	const update = trpc.videos.update.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to update video!');
		},
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });

			toast.success('Video updated!');
		},
	});

	const remove = trpc.videos.remove.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to remove video!');
		},
		onSuccess: () => {
			utils.studio.getMany.invalidate();

			toast.success('Video removed!');
			router.push('/studio');
		},
	});

	const revalidate = trpc.videos.revalidate.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to refresh video data!');
		},
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
		},
	});

	const generateDescription = trpc.videos.generateDescription.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to generate video description!');
		},
		onSuccess: () => {
			toast('Generating Video description...\nThis may take some time.', {
				icon: <CheckCircle2Icon className='size-6 text-primary' />,
			});
		},
	});

	const generateTitle = trpc.videos.generateTitle.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to generate video title!');
		},
		onSuccess: () => {
			toast('Generating Video title...\nThis may take some time.', {
				icon: <CheckCircle2Icon className='size-6 text-primary' />,
			});
		},
	});

	const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to restore video thumbnail!');
		},
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });

			toast.success('Thumbnail restored!');
		},
	});

	const form = useForm<z.infer<typeof VideoUpdateSchema>>({
		defaultValues: video,
		resolver: zodResolver(VideoUpdateSchema),
	});

	const onSubmit = (data: z.infer<typeof VideoUpdateSchema>) => {
		update.mutate(data);
	};

	const fullUrl = absoluteUrl(`/videos/${videoId}`);

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			setIsCopied(true);

			setTimeout(() => {
				setIsCopied(false);
			}, 2000);
		} catch (error) {
			setIsCopied(false);
			toast.error(error instanceof Error ? error.message : 'Failed to copy video url!');
		}
	};

	const isUpdating = update.isPending;
	const isRemoving = remove.isPending;
	const isRestoring = restoreThumbnail.isPending;
	const isGeneratingDescription = generateDescription.isPending;
	const isGeneratingTitle = generateTitle.isPending;
	const isGenerating = isGeneratingDescription || isGeneratingTitle;
	const isPending = isUpdating || isRemoving;
	const isRefreshing = revalidate.isPending;

	return (
		<>
			<ThumbnailGenerateModal
				open={thumbnailGenerateModalOpen}
				onOpenChange={setThumbnailGenerateModalOpen}
				videoId={videoId}
			/>
			<ThumbnailUploadModal
				open={thumbnailUploadModalOpen}
				onOpenChange={setThumbnailUploadModalOpen}
				videoId={videoId}
			/>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='mb-6 flex items-center justify-between'>
						<div>
							<h1 className='text-2xl font-bold'>Video details</h1>
							<p className='text-xs text-muted-foreground'>Manage your video details.</p>
						</div>

						<div className='flex items-center gap-x-2'>
							<Button type='submit' disabled={isPending || !form.formState.isDirty} isLoading={isUpdating}>
								Save
							</Button>

							<Button
								type='button'
								variant='secondary'
								size='icon'
								disabled={isPending || isRefreshing}
								onClick={() => revalidate.mutate({ id: videoId })}
							>
								<RefreshCwIcon className={cn('size-4', isRefreshing && 'animate-spin')} />
								<span className='sr-only'>Refresh video data</span>
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button type='button' variant='ghost' size='icon' disabled={isPending}>
										{isRemoving ? (
											<Loader2Icon className='size-4 animate-spin' />
										) : (
											<MoreVerticalIcon className='size-4' />
										)}
										<span className='sr-only'>More video options</span>
									</Button>
								</DropdownMenuTrigger>

								{/* TODO: Add confirm delete dialog */}
								<DropdownMenuContent onClick={() => remove.mutate({ id: videoId })} align='end'>
									<DropdownMenuItem variant='destructive' disabled={isPending}>
										<Trash2Icon className='size-4' />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
						<div className='col-span-3 space-y-8'>
							<FormField
								disabled={isPending}
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className='flex items-center gap-x-2'>
												Title
												<Button
													type='button'
													size='icon'
													variant='outline'
													className='size-6 rounded-full [&_svg]:size-3'
													onClick={() => generateTitle.mutate({ id: videoId })}
													disabled={isGenerating || !video.muxTrackId}
													isLoading={isGeneratingTitle}
												>
													<SparklesIcon />
												</Button>
											</div>
										</FormLabel>

										<FormControl>
											<Input {...field} placeholder='Add a title to your video' />
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								disabled={isPending}
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className='flex items-center gap-x-2'>
												Description
												<Button
													type='button'
													size='icon'
													variant='outline'
													className='size-6 rounded-full [&_svg]:size-3'
													onClick={() => generateDescription.mutate({ id: videoId })}
													disabled={isGenerating || !video.muxTrackId}
													isLoading={isGeneratingDescription}
												>
													<SparklesIcon />
												</Button>
											</div>
										</FormLabel>

										<FormControl>
											<Textarea
												{...field}
												value={field.value ?? ''}
												rows={10}
												placeholder='Add a description to your video'
												className='resize-none pr-10'
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='thumbnailUrl'
								render={() => (
									<FormItem>
										<FormLabel>Thumbnail</FormLabel>

										<FormControl>
											<div className='group relative h-[84px] w-[153px] border border-dashed bg-neutral-400 p-0.5'>
												<Image
													src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
													alt={`Thumbnail of ${video.title}`}
													fill
												/>

												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															type='button'
															size='icon'
															className='absolute right-1 top-1 size-7 rounded-full border border-white/50 bg-black/50 opacity-100 duration-300 hover:bg-black/50 group-hover:opacity-100 data-[state=open]:opacity-100 md:opacity-0 md:disabled:opacity-100'
															disabled={isPending || isRestoring || isGenerating}
															isLoading={isRestoring}
														>
															<MoreVerticalIcon className='size-4 text-white' />
															<span className='sr-only'>More image options</span>
														</Button>
													</DropdownMenuTrigger>

													<DropdownMenuContent align='start' side='right'>
														<DropdownMenuItem onClick={() => setThumbnailUploadModalOpen(true)}>
															<ImagePlusIcon className='size-4' />
															Change
														</DropdownMenuItem>

														<DropdownMenuItem onClick={() => setThumbnailGenerateModalOpen(true)}>
															<SparklesIcon className='size-4' />
															AI-generated
														</DropdownMenuItem>

														{/* TODO: Add confirm restore dialog */}
														<DropdownMenuItem onClick={() => restoreThumbnail.mutate({ id: videoId })}>
															<RotateCcwIcon className='size-4' />
															Restore
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								disabled={isPending}
								control={form.control}
								name='categoryId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>

										<Select
											onValueChange={field.onChange}
											defaultValue={field.value ?? undefined}
											disabled={field.disabled}
										>
											<FormControl>
												<SelectTrigger disabled={field.disabled}>
													<SelectValue placeholder='Select a category' />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												{categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className='flex flex-col gap-y-8 lg:col-span-2'>
							<div className='flex h-fit flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]'>
								<div className='relative aspect-video overflow-hidden'>
									<VideoPlayer
										playbackId={video.muxPlaybackId}
										duration={video.duration}
										thumbnailUrl={video.thumbnailUrl}
										previewUrl={video.previewUrl}
										title={video.title}
									/>
								</div>

								<div className='flex flex-col gap-y-6 p-4'>
									<div className='flex items-center justify-between gap-x-2'>
										<div className='flex flex-col gap-y-1'>
											<p className='text-xs text-muted-foreground'>Video link</p>

											<div className='flex items-center gap-x-2'>
												<Link href={`/videos/${video.id}`}>
													<p className='line-clamp-1 text-sm text-blue-500'>{fullUrl}</p>
												</Link>

												<Button
													type='button'
													variant='ghost'
													size='icon'
													className='shrink-0'
													onClick={onCopy}
													disabled={isCopied}
												>
													{isCopied ? <CopyCheckIcon className='size-4' /> : <CopyIcon className='size-4' />}
													<span className='sr-only'>Copy video url to clipboard</span>
												</Button>
											</div>
										</div>
									</div>

									<div className='flex items-center justify-between'>
										<div className='flex flex-col gap-y-1'>
											<p className='text-xs text-muted-foreground'>Video status</p>
											<p className='text-sm'>{snakeCaseToTitle(video.muxStatus || MuxStatus.PREPARING)}</p>
										</div>
									</div>

									<div className='flex items-center justify-between'>
										<div className='flex flex-col gap-y-1'>
											<p className='text-xs text-muted-foreground'>Subtitles status</p>
											<p className='text-sm'>{snakeCaseToTitle(video.muxTrackStatus || 'no_subtitles')}</p>
										</div>
									</div>
								</div>
							</div>

							<FormField
								disabled={isPending}
								control={form.control}
								name='visibility'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Visibility</FormLabel>

										<Select
											onValueChange={field.onChange}
											defaultValue={field.value ?? undefined}
											disabled={field.disabled}
										>
											<FormControl>
												<SelectTrigger disabled={field.disabled}>
													<SelectValue placeholder='Select visibility' />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												<SelectItem value={VideoVisibility.PUBLIC}>
													<div className='flex items-center gap-x-2'>
														<Globe2Icon className='size-4' />
														Public
													</div>
												</SelectItem>

												<SelectItem value={VideoVisibility.PRIVATE}>
													<div className='flex items-center gap-x-2'>
														<LockIcon className='size-4' />
														Private
													</div>
												</SelectItem>
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</form>
			</Form>
		</>
	);
};
