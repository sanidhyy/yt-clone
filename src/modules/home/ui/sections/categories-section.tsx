'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { ErrorBoundary } from 'react-error-boundary';

import { FilterCarousel } from '@/components/filter-carousel';
import { trpc } from '@/trpc/client';

const CategoriesSkeleton = () => {
	return <FilterCarousel isLoading data={[]} onSelect={() => {}} />;
};

interface CategoriesSectionProps {
	categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
	return (
		<Suspense fallback={<CategoriesSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<CategoriesSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
	const router = useRouter();
	const [categories] = trpc.categories.getMany.useSuspenseQuery();

	const data = categories.map(({ id, name }) => ({
		label: name,
		value: id,
	}));

	const onSelect = (value: string | null) => {
		const url = new URL(window.location.href);

		if (value) {
			url.searchParams.set('categoryId', value);
		} else {
			url.searchParams.delete('categoryId');
		}

		router.push(url.toString());
	};

	return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />;
};
