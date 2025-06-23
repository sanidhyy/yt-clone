'use client';

import { Suspense } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { MoreVerticalIcon, Trash2Icon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';

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
import { VideoUpdateSchema } from '@/db/schema';
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

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='icon' disabled={isPending}>
									<MoreVerticalIcon className='size-4' />
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
									{/* TODO: Add AI generate button */}

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
				</div>
			</form>
		</Form>
	);
};
