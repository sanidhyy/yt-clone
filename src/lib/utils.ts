import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env/client';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const absoluteUrl = (path: string): string => {
	const formattedPath = path.trim();
	if (formattedPath.startsWith('http')) return formattedPath;

	let baseUrl = env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';

	// Note: Don't use env from @/server/env here.
	const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
	const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;

	if (!!vercelEnv && vercelEnv === 'preview' && !!vercelUrl) baseUrl = `https://${vercelUrl}`;

	return `${baseUrl}${formattedPath.startsWith('/') ? '' : '/'}${formattedPath}`;
};

export function formatDuration(duration: number) {
	const seconds = Math.floor((duration % 60000) / 1000);
	const minutes = Math.floor(duration / 60000);

	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function snakeCaseToTitle(str: string) {
	return str.replaceAll(/_/g, ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase());
}
