import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ClerkProvider } from '@clerk/nextjs';

import { ToasterProvider } from '@/components/providers/toaster-provider';
import { cn } from '@/lib/utils';
import { TRPCProvider } from '@/trpc/client';

import './globals.css';

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
					<TRPCProvider>
						<ToasterProvider />

						{children}
					</TRPCProvider>
				</body>
			</html>
		</ClerkProvider>
	);
};

export default RootLayout;
