import type { PropsWithChildren } from 'react';

import { StudioNavbar } from '@/modules/studio/ui/components/studio-navbar';
import { StudioSidebar } from '@/modules/studio/ui/components/studio-sidebar';

import { SidebarProvider } from '@/components/ui/sidebar';

export const StudioLayout = ({ children }: PropsWithChildren) => {
	return (
		<SidebarProvider>
			<div className='w-full'>
				<StudioNavbar />

				<div className='flex min-h-screen pt-16'>
					<StudioSidebar />

					<main className='flex-1 overflow-y-auto'>{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
};
