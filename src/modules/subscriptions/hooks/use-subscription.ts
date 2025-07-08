import { useState } from 'react';

import { useClerk } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

import { trpc } from '@/trpc/client';

interface UseSubscriptionProps {
	isSubscribed: boolean;
	userId: string;
	initialSubscriberCount: number;
}

export const useSubscription = ({ isSubscribed, userId, initialSubscriberCount }: UseSubscriptionProps) => {
	const clerk = useClerk();

	// Optimistic state for subscription status and subscriber count
	const [optimisticState, setOptimisticState] = useState({
		hasOptimisticUpdate: false,
		isSubscribed: isSubscribed,
		subscriberCount: initialSubscriberCount,
	});

	useState(() => {
		if (
			!optimisticState.hasOptimisticUpdate &&
			(optimisticState.isSubscribed !== isSubscribed || optimisticState.subscriberCount !== initialSubscriberCount)
		) {
			setOptimisticState({
				hasOptimisticUpdate: false,
				isSubscribed: isSubscribed,
				subscriberCount: initialSubscriberCount,
			});
		}
	});

	const subscribe = trpc.subscriptions.create.useMutation({
		onError: (error) => {
			// Revert optimistic update on error
			setOptimisticState({
				hasOptimisticUpdate: false,
				isSubscribed: isSubscribed,
				subscriberCount: initialSubscriberCount,
			});
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to subscribe this user!');
			}
		},
		onSuccess: () => {
			// TODO: Reinvalidate subscriptions.getMany, users.getOne
		},
	});

	const unsubscribe = trpc.subscriptions.remove.useMutation({
		onError: (error) => {
			// Revert optimistic update on error
			setOptimisticState({
				hasOptimisticUpdate: false,
				isSubscribed: isSubscribed,
				subscriberCount: initialSubscriberCount,
			});
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to unsubscribe this user!');
			}
		},
		onSuccess: () => {
			// TODO: Reinvalidate subscriptions.getMany, users.getOne
		},
	});

	const onClick = () => {
		setOptimisticState((prevState) => {
			if (prevState.isSubscribed) {
				// Optimistically unsubscribe
				return {
					hasOptimisticUpdate: true,
					isSubscribed: false,
					subscriberCount: prevState.subscriberCount - 1,
				};
			} else {
				// Optimistically subscribe
				return {
					hasOptimisticUpdate: true,
					isSubscribed: true,
					subscriberCount: prevState.subscriberCount + 1,
				};
			}
		});

		if (optimisticState.isSubscribed) {
			unsubscribe.mutate({ userId });
		} else {
			subscribe.mutate({ userId });
		}
	};

	return {
		isSubscribed: optimisticState.isSubscribed,
		onClick,
		subscriberCount: optimisticState.subscriberCount,
	};
};
