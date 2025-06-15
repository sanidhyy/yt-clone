'use client';

import Link from 'next/link';

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

export const PersonalSection = () => {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>You</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu>
					{NAV_ITEMS.map(({ icon: Icon, title, url }) => (
						<SidebarMenuItem key={url}>
							<SidebarMenuButton
								tooltip={title}
								asChild
								isActive={false} // TODO: Change to look at current pathname
								onClick={() => {}} // TODO: Implement on click functionality
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
