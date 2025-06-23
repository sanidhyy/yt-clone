'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	CopyCheckIcon,
	CopyIcon,
	Globe2Icon,
	LockIcon,
	MoreVerticalIcon,
	RefreshCwIcon,
	Trash2Icon,
} from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';

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
import { Textarea } from '@/components/ui/textarea';
import { MuxStatus, VideoUpdateSchema, VideoVisibility } from '@/db/schema';
import { env } from '@/env/client';
import { cn, snakeCaseToTitle } from '@/lib/utils';
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
	return <p>Loading...</p>;
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
	const utils = trpc.useUtils();
	const [isCopied, setIsCopied] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

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

	const form = useForm<z.infer<typeof VideoUpdateSchema>>({
		defaultValues: video,
		resolver: zodResolver(VideoUpdateSchema),
	});

	const onSubmit = (data: z.infer<typeof VideoUpdateSchema>) => {
		update.mutate(data);
	};

	const fullUrl = `${env.NEXT_PUBLIC_APP_BASE_URL}/videos/${videoId}`;

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

	const onRefresh = async () => {
		try {
			setIsRefreshing(true);

			await utils.studio.getOne.invalidate({ id: videoId });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to copy video url!');
		} finally {
			setIsRefreshing(false);
		}
	};

	const isPending = update.isPending;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h1 className='text-2xl font-bold'>Video details</h1>
						<p className='text-xs text-muted-foreground'>Manage your video details.</p>
					</div>

					<div className='flex items-center gap-x-2'>
						<Button type='submit' disabled={isPending} isLoading={isPending}>
							Save
						</Button>

						<Button
							type='button'
							variant='secondary'
							size='icon'
							disabled={isPending || isRefreshing}
							onClick={onRefresh}
						>
							<RefreshCwIcon className={cn('size-4', isRefreshing && 'animate-spin')} />
							<span className='sr-only'>Refresh video data</span>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button type='button' variant='ghost' size='icon' disabled={isPending}>
									<MoreVerticalIcon className='size-4' />
									<span className='sr-only'>More video options</span>
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align='end'>
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
									<FormLabel>Title</FormLabel>
									{/* TODO: Add AI generate button */}

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
									<FormLabel>Description</FormLabel>
									{/* TODO: Add AI generate button */}

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

						{/* TODO: Add thumbnail field */}

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
	);
};
