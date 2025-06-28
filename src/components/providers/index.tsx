import { PropsWithChildren } from 'react';

import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';

import { appFileRouter } from '@/app/api/uploadthing/core';
import { TRPCProvider } from '@/trpc/client';

import { ToasterProvider } from './toaster-provider';

export const Providers = ({ children }: PropsWithChildren) => {
	return (
		<TRPCProvider>
			<ToasterProvider />
			<NextSSRPlugin routerConfig={extractRouterConfig(appFileRouter)} />

			{children}
		</TRPCProvider>
	);
};
