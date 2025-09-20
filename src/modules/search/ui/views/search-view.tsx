import { CategoriesSection } from '@/modules/search/ui/sections/categories-section';

interface SearchViewProps {
	query: string | undefined;
	categoryId: string | undefined;
}

export const SearchView = ({ query, categoryId }: SearchViewProps) => {
	return (
		<div className='mx-auto mb-10 flex max-w-[1300px] flex-col gap-y-6 px-4 pt-2.5'>
			<CategoriesSection categoryId={categoryId} />
		</div>
	);
};
