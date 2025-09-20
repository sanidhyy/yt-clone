'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { absoluteUrl } from '@/lib/utils';

export const SearchInput = () => {
	const router = useRouter();
	const [searchValue, setSearchValue] = useState('');

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const url = new URL(absoluteUrl('/search'));
		const newQuery = searchValue.trim();

		if (!!newQuery) url.searchParams.set('query', encodeURIComponent(newQuery));
		else url.searchParams.delete('query');

		setSearchValue(newQuery);
		router.push(url.toString());
	};

	return (
		<form
			onSubmit={handleSearch}
			className='flex w-full max-w-[600px] rounded-full border focus-within:border-blue-500'
		>
			<div className='relative w-full'>
				<input
					type='search'
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					placeholder='Search'
					className='w-full rounded-l-full border py-2 pl-4 pr-12 focus:outline-none'
				/>

				{!!searchValue.trim() && (
					<Button
						type='button'
						variant='ghost'
						size='icon'
						onClick={() => setSearchValue('')}
						className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full'
					>
						<XIcon className='text-gray-500' />
					</Button>
				)}
			</div>

			<button
				disabled={!searchValue.trim()}
				type='submit'
				className='rounded-r-full border border-l-0 bg-gray-100 px-5 py-2.5 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
			>
				<SearchIcon className='size-5' />
			</button>
		</form>
	);
};
