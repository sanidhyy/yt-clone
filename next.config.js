import { fileURLToPath } from 'node:url';

import { createJiti } from 'jiti';

const jiti = createJiti(fileURLToPath(import.meta.url));

// validate env during build
await jiti.import('./src/env/client');
await jiti.import('./src/env/server');

/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: {
		appIsrStatus: false,
		buildActivity: false,
	},
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
		],
	},
};

export default nextConfig;
