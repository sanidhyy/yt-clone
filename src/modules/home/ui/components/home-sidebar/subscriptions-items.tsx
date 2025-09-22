'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ListIcon } from 'lucide-react';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { trpc } from '@/trpc/client';

export const SubscriptionsItemsSkeleton = () => {
	return (
		<>
			{Array.from({ length: 4 }).map((_, i) => (
				<SidebarMenuItem key={i}>
					<SidebarMenuButton disabled>
						<Skeleton className='size-6 shrink-0 rounded-full' />
						<Skeleton className='h-4 w-full' />
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</>
	);
};

export const SubscriptionsItems = () => {
	const pathname = usePathname();
	const { data: subscriptions, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
		{
			limit: 5,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Subscriptions</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu>
					{isLoading && <SubscriptionsItemsSkeleton />}
					{!isLoading &&
						subscriptions?.pages
							?.flatMap((page) => page.items)
							.map((subscription) => (
								<SidebarMenuItem key={`${subscription.creatorId}-${subscription.viewerId}`}>
									<SidebarMenuButton
										tooltip={subscription.user.name}
										asChild
										isActive={pathname === `/users/${subscription.user.id}`}
									>
										<Link prefetch href={`/users/${subscription.user.id}`} className='flex items-center gap-4'>
											<UserAvatar size='xs' imageUrl={subscription.user.imageUrl} name={subscription.user.name} />
											<span className='text-sm font-medium'>{subscription.user.name}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}

					{!isLoading && (
						<SidebarMenuItem>
							<SidebarMenuButton isActive={pathname === '/subscriptions'} asChild>
								<Link prefetch href='/subscriptions' className='flex items-center gap-4'>
									<ListIcon className='size-4' />
									<span className='text-sm'>All subscriptions</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
