import type { NextConfig } from 'next';

import '@/env/client';
import '@/env/server';

const nextConfig: NextConfig = {
	devIndicators: false,
	images: {
		remotePatterns: [
			{
				hostname: 'lh3.googleusercontent.com',
				pathname: '/a/**',
				port: '',
				protocol: 'https',
			},
			{
				hostname: 'img.clerk.com',
				port: '',
				protocol: 'https',
			},
			{
				hostname: 'image.mux.com',
				port: '',
				protocol: 'https',
			},
			{
				hostname: `${process.env.UPLOADTHING_APP_ID}.ufs.sh`,
				pathname: '/f/*',
				port: '',
				protocol: 'https',
			},
		],
	},
};

export default nextConfig;
