import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ClerkProvider } from '@clerk/nextjs';

import { cn } from '@/lib/utils';

import './globals.css';

import { TRPCProvider } from '@/trpc/client';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
	description: 'Full-Stack YouTube Clone using Next.js',
	title: 'NewTube',
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<ClerkProvider afterSignOutUrl='/'>
			<html lang='en'>
				<body className={cn('antialiased', inter.className)}>
					<TRPCProvider>{children}</TRPCProvider>
				</body>
			</html>
		</ClerkProvider>
	);
};

export default RootLayout;
