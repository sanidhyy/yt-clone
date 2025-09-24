import { SignedIn } from '@clerk/nextjs';

import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';

import { MainItems } from './main-items';
import { OtherItems } from './other-items';
import { PersonalItems } from './personal-items';
import { SubscriptionsItems } from './subscriptions-items';

export const HomeSidebar = () => {
	return (
		<Sidebar className='z-40 border-none pt-16' collapsible='icon'>
			<SidebarContent className='bg-background'>
				<MainItems />
				<Separator />
				<PersonalItems />
				<SignedIn>
					<>
						<Separator />
						<SubscriptionsItems />
					</>
				</SignedIn>

				<OtherItems />
			</SidebarContent>
		</Sidebar>
	);
};
