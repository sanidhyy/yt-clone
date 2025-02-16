import type { Metadata } from 'next';
import { Geist, Geist_Mono as GeistMono } from 'next/font/google';

import { cn } from '@/lib/utils';

import './globals.css';

const geistSans = Geist({
	subsets: ['latin'],
	variable: '--font-geist-sans',
});

const geistMono = GeistMono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
});

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
			<body className={cn('antialiased', geistSans.variable, geistMono.variable)}>{children}</body>
		</html>
	);
};

export default RootLayout;
