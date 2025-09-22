'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth, useClerk } from '@clerk/nextjs';
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from 'lucide-react';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

const NAV_ITEMS = [
	{
		auth: true,
		icon: HistoryIcon,
		title: 'History',
		url: '/playlists/history',
	},
	{
		auth: true,
		icon: ThumbsUpIcon,
		title: 'Liked videos',
		url: '/playlists/liked',
	},
	{
		auth: true,
		icon: ListVideoIcon,
		title: 'All playlists',
		url: '/playlists',
	},
];

export const PersonalItems = () => {
	const clerk = useClerk();
	const pathname = usePathname();
	const { isSignedIn } = useAuth();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>You</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu>
					{NAV_ITEMS.map(({ auth, icon: Icon, title, url }) => (
						<SidebarMenuItem key={url}>
							<SidebarMenuButton
								tooltip={title}
								asChild
								isActive={pathname === url}
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
