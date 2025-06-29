import { cva, type VariantProps } from 'class-variance-authority';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const userInfoVariants = cva('flex items-center gap-1', {
	defaultVariants: {
		size: 'default',
	},
	variants: {
		size: {
			default: '[&_p]:text-sm [&_svg]:size-4',
			lg: '[&_p]:text-base [&_p]:font-medium [&_p]:text-black [&_svg]:size-5',
			sm: '[&_p]:text-xs [&_svg]:size-3.5',
		},
	},
});

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
	name: string;
	className?: string;
}

export const UserInfo = ({ name, className, size }: UserInfoProps) => {
	return (
		<div className={cn(userInfoVariants({ className, size }))}>
			<Tooltip>
				<TooltipTrigger asChild>
					<p className='line-clamp-1 text-gray-500 hover:text-gray-800'>{name}</p>
				</TooltipTrigger>

				<TooltipContent align='center' className='bg-black/70'>
					<p>{name}</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
};
