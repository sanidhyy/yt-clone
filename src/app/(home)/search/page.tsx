import { SearchView } from '@/modules/search/ui/views/search-view';

import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
	searchParams: Promise<{
		query: string | undefined;
		categoryId: string | undefined;
	}>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
	const { query, categoryId } = await searchParams;

	void trpc.categories.getMany.prefetch();

	return (
		<HydrateClient>
			<SearchView query={query} categoryId={categoryId} />
		</HydrateClient>
	);
};
export default SearchPage;
