import { useState } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VideoDescriptionProps {
	compactDate: string;
	compactViews: string;
	expandedDate: string;
	expandedViews: string;
	views: number;
	description?: string | null;
}

export const VideoDescription = ({
	compactDate,
	compactViews,
	expandedDate,
	expandedViews,
	description,
	views,
}: VideoDescriptionProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const isDescription = !!description?.trim();

	return (
		<div
			onClick={() => {
				if (isExpanded) return;

				setIsExpanded(true);
			}}
			className={cn('rounded-xl bg-secondary/50 p-3 transition hover:bg-secondary/70', !isExpanded && 'cursor-pointer')}
		>
			{isExpanded ? (
				<div className='mb-2 flex gap-2 text-sm'>
					<span className='font-medium'>
						{expandedViews} view{views !== 1 && 's'}
					</span>
					<span className='font-medium'>{expandedDate}</span>
				</div>
			) : (
				<Tooltip>
					<TooltipTrigger>
						<div className='mb-2 flex gap-2 text-sm'>
							<span className='font-medium'>
								{compactViews} view{views !== 1 && 's'}
							</span>
							<span className='font-medium'>{compactDate}</span>
						</div>
					</TooltipTrigger>

					<TooltipContent align='start' className='bg-black/70' hideArrow>
						<div className='flex gap-2 text-xs'>
							<span className='font-medium'>
								{expandedViews} view{views !== 1 && 's'}
							</span>
							<span className='font-medium'>&bull;</span>
							<span className='font-medium'>{expandedDate}</span>
						</div>
					</TooltipContent>
				</Tooltip>
			)}

			<div className='relative'>
				<p
					className={cn(
						'whitespace-pre-wrap text-sm',
						!isExpanded && 'line-clamp-2',
						!isDescription && 'italic text-muted-foreground'
					)}
				>
					{isDescription ? description : 'No description'}
				</p>

				<Button
					variant='ghost'
					className={cn(
						'mt-4 flex items-center gap-1 rounded-full text-sm font-medium hover:bg-transparent',
						isExpanded && 'hover:bg-gray-200'
					)}
					onClick={() => {
						if (!isExpanded) return;

						setIsExpanded(false);
					}}
				>
					{isExpanded ? (
						<>
							Show less <ChevronUpIcon className='size-4' />
						</>
					) : (
						<>
							Show more <ChevronDownIcon className='size-4' />
						</>
					)}
				</Button>
			</div>
		</div>
	);
};
