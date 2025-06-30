'use client';

import { useState } from 'react';

import { ArrowLeftIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { SearchInput } from './search-input';

export const SearchBar = () => {
	const [showSearchInput, setShowSearchInput] = useState(false);

	return (
		<>
			<div className='mx-auto hidden max-w-[720px] flex-1 justify-center sm:flex'>
				<SearchInput />
			</div>

			{showSearchInput ? (
				<div className='absolute z-[51] h-16 w-full bg-white p-2'>
					<div className='flex w-full flex-1 items-center justify-center gap-2'>
						<Button
							type='button'
							size='icon'
							variant='ghost'
							className='rounded-full [&_svg]:size-6'
							onClick={() => setShowSearchInput(false)}
						>
							<ArrowLeftIcon />
						</Button>
						<SearchInput />
					</div>
				</div>
			) : (
				<div className='ml-auto flex items-center justify-center sm:hidden'>
					<Button
						type='button'
						size='icon'
						variant='ghost'
						className='rounded-full [&_svg]:size-5'
						onClick={() => setShowSearchInput(true)}
					>
						<SearchIcon strokeWidth={2.1} />
					</Button>
				</div>
			)}
		</>
	);
};
