import type { PropsWithChildren } from 'react';

import { HomeLayout } from '@/modules/home/ui/layouts/home-layout';

const Layout = ({ children }: PropsWithChildren) => {
	return <HomeLayout>{children}</HomeLayout>;
};

export default Layout;
