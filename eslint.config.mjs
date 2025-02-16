import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends(
		'next',
		'next/core-web-vitals',
		'next/typescript',
		'plugin:prettier/recommended',
		'plugin:tailwindcss/recommended'
	),
	...compat.config({
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			camelcase: ['error', { properties: 'always' }],
			'no-alert': 'error',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'prefer-arrow-callback': 'warn',
			'prettier/prettier': [
				'warn',
				{
					endOfLine: 'auto',
				},
			],
			'sort-keys': 'warn',
			'sort-vars': 'warn',
			'tailwindcss/no-custom-classname': 'warn',
		},
		settings: {
			tailwindcss: {
				callees: [
					'cva', // https://cva.style

					// a project is typically configured with one of these, the shape of arguments match `classnames`
					'classnames',
					'classNames',
					'clsx',
					'cn',
					'cns',
					'cx',
				],
				config: './tailwind.config.ts',
			},
		},
	}),
	...compat.plugins('tailwindcss'),
];

export default eslintConfig;
