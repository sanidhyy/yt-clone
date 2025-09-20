export const dynamic = 'force-dynamic';

interface SearchPageProps {
	searchParams: Promise<{
		query: string | undefined;
		categoryId: string | undefined;
	}>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
	const { query, categoryId } = await searchParams;

	return (
		<div>
			Searching for {query} in category {categoryId}
		</div>
	);
};
export default SearchPage;
