'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { useAuth } from '@clerk/nextjs';

import { useSubscription } from '@/modules/subscriptions/hooks/use-subscription';
import { SubscriptionButton } from '@/modules/subscriptions/ui/components/subscription-button';
import { UserInfo } from '@/modules/users/ui/components/user-info';
import type { VideoGetOneOutput } from '@/modules/videos/types';

import { buttonVariants } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

interface VideoOwnerProps {
	user: VideoGetOneOutput['user'];
	videoId: string;
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
	const { userId: clerkUserId, isLoaded } = useAuth();
	const { onClick, isSubscribed, subscriberCount } = useSubscription({
		initialSubscriberCount: user.subscriberCount,
		isSubscribed: user.viewerSubscribed,
		userId: user.id,
	});

	const compactSubscriberCount = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(subscriberCount);
	}, [subscriberCount]);

	return (
		<div className='flex min-w-0 items-center justify-between gap-3 sm:items-start sm:justify-start'>
			<Link href={`/users/${user.id}`}>
				<div className='flex min-w-0 items-center gap-3'>
					<UserAvatar size='lg' imageUrl={user.imageUrl} name={user.name} />

					<div className='flex min-w-0 flex-col gap-0'>
						<UserInfo size='lg' name={user.name} />
						<span className='line-clamp-1 text-xs leading-3 text-muted-foreground'>
							{compactSubscriberCount} subscribers
						</span>
					</div>
				</div>
			</Link>

			{clerkUserId === user.clerkId ? (
				<Link
					href={`/studio/videos/${videoId}`}
					className={cn(buttonVariants({ variant: 'secondary' }), 'rounded-full')}
				>
					Edit video
				</Link>
			) : (
				<SubscriptionButton onClick={onClick} disabled={!isLoaded} isSubscribed={isSubscribed} className='flex-none' />
			)}
		</div>
	);
};
