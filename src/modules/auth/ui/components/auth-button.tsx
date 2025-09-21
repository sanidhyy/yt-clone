'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ClapperboardIcon, UserCircleIcon, UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const AuthButton = () => {
	return (
		<>
			<SignedIn>
				<UserButton>
					<UserButton.MenuItems>
						<UserButton.Link label='My Profile' href='/users/current' labelIcon={<UserIcon className='size-4' />} />
						<UserButton.Link label='Studio' href='/studio' labelIcon={<ClapperboardIcon className='size-4' />} />
						<UserButton.Action label='manageAccount' />
					</UserButton.MenuItems>
				</UserButton>
			</SignedIn>

			<SignedOut>
				<SignInButton mode='modal'>
					<Button
						variant='outline'
						className='rounded-full border-blue-500/20 px-4 py-2 text-sm font-medium text-blue-600 shadow-none hover:text-blue-500'
					>
						<UserCircleIcon />
						Sign in
					</Button>
				</SignInButton>
			</SignedOut>
		</>
	);
};
