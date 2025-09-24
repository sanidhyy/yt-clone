import Image from 'next/image';
import Link from 'next/link';

import { Separator } from '@/components/ui/separator';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { links } from '@/config';

export const OtherItems = () => {
	return (
		<div className='mt-auto'>
			<Separator />
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton tooltip='Source Code' asChild>
								<Link
									href={links.sourceCode}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-4'
								>
									<Image src='/github.svg' alt='GitHub' height={16} width={16} />
									<span className='text-sm font-medium'>Source Code</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</div>
	);
};
