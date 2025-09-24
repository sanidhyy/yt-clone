'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { TriangleAlertIcon } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

import { FilterCarousel } from '@/components/filter-carousel';
import { absoluteUrl } from '@/lib/utils';
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
			<ErrorBoundary
				fallback={
					<p className='text-sm text-destructive'>
						<TriangleAlertIcon className='-mt-0.5 mr-1 inline size-4' /> Failed to fetch categories!
					</p>
				}
			>
				<CategoriesSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [categories] = trpc.categories.getMany.useSuspenseQuery();

	const data = categories.map(({ id, name }) => ({
		label: name,
		value: id,
	}));

	const onSelect = useCallback(
		(value: string | null) => {
			const params = new URLSearchParams(searchParams.toString());

			if (value) params.set('categoryId', value);
			else params.delete('categoryId');

			router.push(absoluteUrl(`/search?${params.toString()}`));
		},
		[router, searchParams]
	);

	return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />;
};
