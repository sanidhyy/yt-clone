import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubscriptionButtonProps {
	disabled?: boolean;
	isLoading?: boolean;
	isSubscribed: boolean;
	onClick: ButtonProps['onClick'];
	className?: string;
	size?: ButtonProps['size'];
}

export const SubscriptionButton = ({
	disabled = false,
	isLoading = false,
	isSubscribed,
	onClick,
	className,
	size,
}: SubscriptionButtonProps) => {
	return (
		<Button
			size={size}
			variant={isSubscribed ? 'secondary' : 'default'}
			className={cn('rounded-full', className)}
			onClick={onClick}
			disabled={disabled}
			isLoading={isLoading}
		>
			{isSubscribed ? 'Unsubscribe' : 'Subscribe'}
		</Button>
	);
};
