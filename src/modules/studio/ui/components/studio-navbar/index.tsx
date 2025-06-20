import Image from 'next/image';
import Link from 'next/link';

import { AuthButton } from '@/modules/auth/ui/components/auth-button';

import { SidebarTrigger } from '@/components/ui/sidebar';

export const StudioNavbar = () => {
	return (
		<nav className='fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b bg-white px-2 pr-5 shadow-md'>
			<div className='flex w-full items-center gap-4'>
				{/* Menu and Logo */}
				<div className='flex shrink-0 items-center'>
					<SidebarTrigger />

					<Link href='/studio'>
						<div className='flex items-center gap-1 p-4'>
							<Image src='/logo.svg' alt='NewTube Logo' width={32} height={32} />
							<p className='text-xl font-semibold tracking-tight'>Studio</p>
						</div>
					</Link>
				</div>

				{/* Spacer */}
				<div className='flex-1' />

				<div className='flex shrink-0 items-center gap-4'>
					<AuthButton />
				</div>
			</div>
		</nav>
	);
};
