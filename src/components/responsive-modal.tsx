import { PropsWithChildren } from 'react';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveModalProps {
	open: boolean;
	title: string;
	description?: string;
	onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({
	open,
	title,
	description,
	onOpenChange,
	children,
}: PropsWithChildren<ResponsiveModalProps>) => {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className='px-4 py-2'>
					<DrawerHeader>
						<DrawerTitle>{title}</DrawerTitle>

						<VisuallyHidden.Root>
							<DrawerDescription>{description || title}</DrawerDescription>
						</VisuallyHidden.Root>
					</DrawerHeader>

					{children}
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>

					<VisuallyHidden.Root>
						<DialogDescription>{description || title}</DialogDescription>
					</VisuallyHidden.Root>
				</DialogHeader>

				{children}
			</DialogContent>
		</Dialog>
	);
};
