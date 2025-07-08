import { useClerk } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

import { trpc } from '@/trpc/client';

interface UseSubscriptionProps {
	isSubscribed: boolean;
	userId: string;
	fromVideoId?: string;
}

export const useSubscription = ({ isSubscribed, userId, fromVideoId }: UseSubscriptionProps) => {
	const clerk = useClerk();
	const utils = trpc.useUtils();

	const subscribe = trpc.subscriptions.create.useMutation({
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to subscribe this user!');
			}
		},
		onSuccess: () => {
			// TODO: Reinvalidate subscriptions.getMany, users.getOne

			if (fromVideoId) utils.videos.getOne.invalidate();
		},
	});

	const unsubscribe = trpc.subscriptions.remove.useMutation({
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			} else {
				toast.error(error.message || 'Failed to subscribe this user!');
			}
		},
		onSuccess: () => {
			// TODO: Reinvalidate subscriptions.getMany, users.getOne

			if (fromVideoId) utils.videos.getOne.invalidate();
		},
	});

	const isPending = subscribe.isPending || unsubscribe.isPending;

	const onClick = () => {
		if (isSubscribed) {
			unsubscribe.mutate({ userId });
		} else {
			subscribe.mutate({ userId });
		}
	};

	return { isPending, onClick };
};
