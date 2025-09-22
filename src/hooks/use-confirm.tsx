'use client';

import { useState, type JSX } from 'react';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button, type ButtonProps } from '@/components/ui/button';

interface UseConfirmProps {
	title: string;
	message: string;
	variant?: ButtonProps['variant'];
}

export const useConfirm = ({
	title,
	message,
	variant = 'destructive',
}: UseConfirmProps): [() => JSX.Element, () => Promise<unknown>] => {
	const [isOpen, setIsOpen] = useState(false);
	const [resolver, setResolver] = useState<(value: boolean) => void>();

	const confirm = () => {
		setIsOpen(true);
		return new Promise((resolve) => {
			setResolver(() => resolve);
		});
	};

	const handleClose = () => {
		setIsOpen(false);
		resolver?.(false);
	};

	const handleConfirm = () => {
		setIsOpen(false);
		resolver?.(true);
	};

	const ConfirmationDialog = () => (
		<ResponsiveModal title={title} description={message} open={isOpen} onOpenChange={handleClose}>
			<div className='flex flex-col gap-2'>
				<p className='text-sm text-muted-foreground'>{message}</p>

				<div className='flex w-full items-center justify-end gap-2 pt-4'>
					<Button onClick={handleClose} variant='outline'>
						Cancel
					</Button>

					<Button onClick={handleConfirm} variant={variant}>
						Confirm
					</Button>
				</div>
			</div>
		</ResponsiveModal>
	);

	return [ConfirmationDialog, confirm];
};
