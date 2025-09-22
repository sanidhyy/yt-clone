import { useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

import { SubscriptionButton } from './subscription-button';

export const SubscriptionItemSkeleton = () => {
	return (
		<div className='flex items-start gap-4'>
			<Skeleton className='size-10 rounded-full' />

			<div className='flex-1'>
				<div className='flex items-center justify-between'>
					<div>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='mt-1 h-3 w-20' />
					</div>

					<Skeleton className='h-8 w-20' />
				</div>
			</div>
		</div>
	);
};

interface SubscriptionItemProps {
	name: string;
	imageUrl: string;
	subscriberCount: number;
	onUnsubscribe: () => void;
	isLoading?: boolean;
}

export const SubscriptionItem = ({
	name,
	imageUrl,
	subscriberCount,
	onUnsubscribe,
	isLoading = false,
}: SubscriptionItemProps) => {
	const compactSubscriberCount = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(subscriberCount);
	}, [subscriberCount]);

	return (
		<div className={cn('flex items-start gap-4', isLoading && 'animate-pulse')}>
			<UserAvatar size='lg' imageUrl={imageUrl} name={name} />

			<div className='flex-1'>
				<div className='flex items-center justify-between'>
					<div>
						<h3 className='text-sm'>{name}</h3>
						<p className='text-xs text-muted-foreground'>
							{compactSubscriberCount} subscriber{subscriberCount === 1 ? '' : 's'}
						</p>
					</div>

					<SubscriptionButton
						size='sm'
						onClick={(e) => {
							e.preventDefault();
							onUnsubscribe();
						}}
						disabled={isLoading}
						isSubscribed
					/>
				</div>
			</div>
		</div>
	);
};
