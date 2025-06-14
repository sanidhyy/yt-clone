import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

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
		<html lang='en'>
			<body className={cn('antialiased', inter.className)}>{children}</body>
		</html>
	);
};

export default RootLayout;
