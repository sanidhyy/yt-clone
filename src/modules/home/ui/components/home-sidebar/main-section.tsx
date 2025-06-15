'use client';

import Link from 'next/link';

import { useAuth, useClerk } from '@clerk/nextjs';
import { FlameIcon, HomeIcon, PlaySquareIcon } from 'lucide-react';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
	{
		icon: HomeIcon,
		title: 'Home',
		url: '/',
	},
	{
		auth: true,
		icon: PlaySquareIcon,
		title: 'Subscriptions',
		url: '/feed/subscriptions',
	},
	{
		icon: FlameIcon,
		title: 'Trending',
		url: '/feed/trending',
	},
];

export const MainSection = () => {
	const { isSignedIn } = useAuth();
	const clerk = useClerk();

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{NAV_ITEMS.map(({ auth, icon: Icon, title, url }) => (
						<SidebarMenuItem key={url}>
							<SidebarMenuButton
								tooltip={title}
								asChild
								isActive={false} // TODO: Change to look at current pathname
								onClick={(e) => {
									if (!isSignedIn && auth) {
										e.preventDefault();
										return clerk.openSignIn();
									}
								}}
							>
								<Link href={url} className='flex items-center gap-4'>
									<Icon />
									<span className='text-sm font-medium'>{title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
