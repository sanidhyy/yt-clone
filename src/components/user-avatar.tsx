import { cva, type VariantProps } from 'class-variance-authority';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const avatarVariants = cva('', {
	defaultVariants: {
		size: 'default',
	},
	variants: {
		size: {
			default: 'size-9',
			lg: 'size-10',
			sm: 'size-6',
			xl: 'size-[160px]',
			xs: 'size-4',
		},
	},
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
	imageUrl: string;
	name: string;
	className?: string;
	onClick?: () => void;
}

export const UserAvatar = ({ imageUrl, name, className, onClick, size }: UserAvatarProps) => {
	return (
		<Avatar className={cn(avatarVariants({ className, size }))} onClick={onClick}>
			<AvatarImage src={imageUrl} alt={`${name}'s Profile Picture`} />
		</Avatar>
	);
};
