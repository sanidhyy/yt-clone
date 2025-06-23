'use client';

import { Suspense } from 'react';

import { MoreVerticalIcon, Trash2Icon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
	const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });

	return (
		<div className='mb-6 flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Video details</h1>
				<p className='text-xs text-muted-foreground'>Manage your video details.</p>
			</div>

			<div className='flex items-center gap-x-2'>
				<Button type='submit' disabled={false}>
					Save
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' size='icon'>
							<MoreVerticalIcon className='size-4' />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align='end'>
						<DropdownMenuItem variant='destructive'>
							<Trash2Icon className='size-4' />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};
