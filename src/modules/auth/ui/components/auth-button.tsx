'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { UserCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const AuthButton = () => {
	return (
		<>
			<SignedIn>
				<UserButton />
				{/* TODO: Add menu items for Studio and User Profile */}
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
