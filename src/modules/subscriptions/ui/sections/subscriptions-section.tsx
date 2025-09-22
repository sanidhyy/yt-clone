'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import { ErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

import { SubscriptionItem, SubscriptionItemSkeleton } from '@/modules/subscriptions/ui/components/subscription-item';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

export const SubscriptionsSection = () => {
	return (
		<Suspense fallback={<SubscriptionsSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<SubscriptionsSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const SubscriptionsSectionSkeleton = () => {
	return (
		<div className='flex flex-col gap-4'>
			{Array.from({ length: 8 }).map((_, i) => (
				<SubscriptionItemSkeleton key={i} />
			))}
		</div>
	);
};

const SubscriptionsSectionSuspense = () => {
	const utils = trpc.useUtils();

	const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	const unsubscribe = trpc.subscriptions.remove.useMutation({
		onError: (error) => {
			toast.error(error.message || 'Failed to unsubscribe this user!');
		},
		onSuccess: (data) => {
			utils.videos.getManySubscribed.invalidate();
			utils.subscriptions.getMany.invalidate();
			utils.users.getOne.invalidate({ id: data.creatorId });
		},
	});

	return (
		<>
			<div className='flex flex-col gap-4'>
				{subscriptions.pages
					.flatMap((page) => page.items)
					.map((subscription) => (
						<Link key={subscription.creatorId} href={`/users/${subscription.user.id}`}>
							<SubscriptionItem
								name={subscription.user.name}
								imageUrl={subscription.user.imageUrl}
								subscriberCount={subscription.user.subscriberCount}
								onUnsubscribe={() => {
									unsubscribe.mutate({ userId: subscription.creatorId });
								}}
								isLoading={unsubscribe.isPending}
							/>
						</Link>
					))}
			</div>

			<InfiniteScroll
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</>
	);
};
