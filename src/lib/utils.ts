import { clsx, type ClassValue } from 'clsx';
import { APIError, AuthenticationError, OpenAIError, RateLimitError } from 'openai';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env/client';

export const cn = (...inputs: ClassValue[]) => {
	// eslint-disable-next-line tailwindcss/no-custom-classname
	return twMerge(clsx(inputs));
};

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

export const getSecureCookieName = (cookieName: string) => {
	const isSecure = process.env.NODE_ENV === 'production';

	return isSecure ? `__Secure-${cookieName}` : cookieName;
};

export const formatDuration = (duration: number) => {
	const seconds = Math.floor((duration % 60000) / 1000);
	const minutes = Math.floor(duration / 60000);

	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const snakeCaseToTitle = (str: string) => {
	return str.replaceAll(/_/g, ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase());
};

export const getAISettingsErrorMessage = (error: unknown): string => {
	if (error instanceof AuthenticationError || (error instanceof APIError && error.status === 401)) {
		return 'Invalid API key. Please check your key and try again';
	}

	if (error instanceof RateLimitError || (error instanceof APIError && error.status === 429)) {
		const code = error instanceof APIError ? error.code : null;
		const message = error instanceof Error ? error.message : '';
		const isQuota =
			code === 'insufficient_quota' || /insufficient_quota|exceeded your current quota|quota|billing/i.test(message);

		if (isQuota) return 'Not enough credits. Please purchase more credits and try again';

		return 'Rate limit reached. Please try again in a moment';
	}

	if (error instanceof OpenAIError) return error.message || 'Failed to verify API key';

	if (error instanceof Error) return error.message;

	return 'Failed to verify API key';
};
