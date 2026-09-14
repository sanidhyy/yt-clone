import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { fixupConfigRules } from '@eslint/compat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = defineConfig([
	globalIgnores(['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'migrations/**']),
	...fixupConfigRules(nextVitals),
	...fixupConfigRules(nextTypescript),
	eslintPluginTailwindcss.configs.recommended,
	eslintConfigPrettier,
	eslintPluginPrettierRecommended,
	{
		plugins: {
			tailwindcss: eslintPluginTailwindcss,
		},
		rules: {
			'@next/next/no-img-element': 'off',
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
			'react-hooks/incompatible-library': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'sort-keys': 'warn',
			'sort-vars': 'warn',
			'tailwindcss/classnames-order': 'off',
			'tailwindcss/no-custom-classname': 'warn',
		},
		settings: {
			tailwindcss: {
				callees: ['cva', 'classnames', 'classNames', 'clsx', 'cn', 'cns', 'cx'],
				cssConfigPath: `${__dirname}/src/app/globals.css`,
			},
		},
	},
]);

export default eslintConfig;
