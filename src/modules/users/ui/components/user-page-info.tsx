'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { useClerk } from '@clerk/nextjs';

import { useSubscription } from '@/modules/subscriptions/hooks/use-subscription';
import { SubscriptionButton } from '@/modules/subscriptions/ui/components/subscription-button';
import { UserGetOneOutput } from '@/modules/users/types';

import { buttonVariants } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

interface UserPageInfoProps {
	user: UserGetOneOutput;
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
	const { openUserProfile, loaded, user: clerkUser } = useClerk();

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

	const compactVideoCount = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(user.videoCount);
	}, [user.videoCount]);

	return (
		<div className='py-6'>
			{/* Mobile layout */}
			<div className='flex flex-col md:hidden'>
				<div className='flex items-center gap-3'>
					<UserAvatar
						size='lg'
						imageUrl={user.imageUrl}
						name={user.name}
						className='size-[60px]'
						onClick={() => {
							if (loaded && clerkUser && user.clerkId === clerkUser.id) {
								openUserProfile();
							}
						}}
					/>

					<div className='min-w-0 flex-1'>
						<h1 className='text-xl font-bold'>{user.name}</h1>
						<div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
							<span>
								{compactSubscriberCount} subscriber{user.subscriberCount === 1 ? '' : 's'}
							</span>
							<span>&bull;</span>
							<span>
								{compactVideoCount} video{user.videoCount === 1 ? '' : 's'}
							</span>
						</div>
					</div>
				</div>

				{clerkUser && user.clerkId === clerkUser.id ? (
					<Link href='/studio' className={cn(buttonVariants({ variant: 'secondary' }), 'mt-3 w-full rounded-full')}>
						Go to studio
					</Link>
				) : (
					<SubscriptionButton
						isSubscribed={isSubscribed}
						disabled={!loaded}
						onClick={onClick}
						className='mt-3 w-full'
					/>
				)}
			</div>
		</div>
	);
};
