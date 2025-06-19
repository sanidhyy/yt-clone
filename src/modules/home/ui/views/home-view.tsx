import { CategoriesSection } from '@/modules/home/ui/sections/categories-section';

interface HomeViewProps {
	categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
	return (
		<div className='mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5'>
			<CategoriesSection categoryId={categoryId} />
		</div>
	);
};
