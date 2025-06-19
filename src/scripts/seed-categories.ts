/* eslint-disable no-console */

import { db } from '@/db';
import { categories } from '@/db/schema';

const CATEGORY_NAMES = [
	'Cars and vehicles',
	'Comedy',
	'Education',
	'Gaming',
	'Entertainment',
	'Film and animation',
	'How-to and style',
	'Music',
	'News and politics',
	'People and blogs',
	'Pets and animals',
	'Science and technology',
	'Sports',
	'Travel and events',
];

const main = async () => {
	console.log('Seeding categories...');

	try {
		const values = CATEGORY_NAMES.map((name) => ({
			description: `Videos related to ${name.toLowerCase()}`,
			name,
		}));

		await db.insert(categories).values(values);

		console.log('Categories seeded successfully!');
	} catch (error) {
		console.error('Error seeding categories', error);
		process.exit(1);
	}
};

main();
