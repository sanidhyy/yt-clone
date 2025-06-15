import { SearchIcon } from 'lucide-react';

export const SearchInput = () => {
	// TODO: Add search functionality

	return (
		<form className='flex w-full max-w-[600px] rounded-full border focus-within:border-blue-500'>
			<div className='relative w-full'>
				<input
					type='text'
					placeholder='Search'
					className='w-full rounded-l-full border py-2 pl-4 pr-12 focus:outline-none'
				/>

				{/* TODO: add remove search button */}
			</div>

			<button
				type='submit'
				className='rounded-r-full border border-l-0 bg-gray-100 px-5 py-2.5 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50'
			>
				<SearchIcon className='size-5' />
			</button>
		</form>
	);
};
