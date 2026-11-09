import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

// Import boundaries: every layer of src/lib may import only the layers below it
// (docs/ai/structure.md). In flat config a file-specific no-restricted-imports
// replaces the global one, so each block spreads the shared relative-path ban.
const NO_RELATIVE_ACROSS_FOLDERS = {
	regex: '^\\.\\./(?!app\\.css$)',
	message: 'Import through $lib/... (AGENTS.md section 4).'
};

const layer = (forbidden, why) => ({
	regex: `^\\$lib/(${forbidden.join('|')})(/|$)`,
	message: `${why} See docs/ai/structure.md.`
});

const restrictImports = (...patterns) => ({
	'no-restricted-imports': ['error', { patterns: [NO_RELATIVE_ACROSS_FOLDERS, ...patterns] }]
});

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		linterOptions: { reportUnusedDisableDirectives: 'error' },
		languageOptions: {
			globals: { ...globals.browser, ...globals.node, __APP_VERSION__: 'readonly' }
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		rules: {
			// Links are plain hrefs: the site is static, served from the domain root.
			'svelte/no-navigation-without-resolve': 'off',
			'no-restricted-syntax': [
				'error',
				{
					selector:
						"BinaryExpression[operator=/^[!=]==?$/]:matches([left.type='Identifier'][left.name='undefined'], [left.type='Literal'][left.raw='null'], [right.type='Identifier'][right.name='undefined'], [right.type='Literal'][right.raw='null'])",
					message: 'Use isNullish() / nonNullish() from $lib/utils/nullish.utils.'
				},
				{
					selector:
						"TSAsExpression[expression.type='TSAsExpression'][expression.typeAnnotation.type='TSUnknownKeyword']",
					message: 'No `as unknown as`: type the value (universal standard, rule 6).'
				}
			],
			'@typescript-eslint/no-explicit-any': 'error',
			// Limits for new code. What already exceeds them is listed in
			// eslint-suppressions.json, which may only shrink (docs/ai/pr-and-ci.md).
			complexity: ['error', 10],
			'max-depth': ['error', 3],
			'max-params': ['error', 3],
			'max-nested-callbacks': ['error', 3],
			'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
			'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
			...restrictImports()
		}
	},
	{
		// Catalogs grow with every key; specs are long lists of cases.
		files: ['src/lib/constants/messages/**', 'src/tests/**', 'e2e/**'],
		rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' }
	},
	{
		files: ['src/lib/types/**'],
		rules: restrictImports(
			layer(['constants', 'utils', 'services', 'stores', 'components'], 'Types import only types.')
		)
	},
	{
		files: ['src/lib/constants/**'],
		rules: restrictImports(
			layer(['utils', 'services', 'stores', 'components'], 'Constants import only types.')
		)
	},
	{
		files: ['src/lib/utils/**'],
		rules: restrictImports(
			layer(
				['services', 'stores', 'components'],
				'Utils stay pure: no services, stores or components.'
			)
		)
	},
	{
		files: ['src/lib/services/**'],
		rules: restrictImports(
			layer(['stores', 'components'], 'Services never import a store or a component.')
		)
	},
	{
		files: ['src/lib/stores/**'],
		rules: restrictImports(layer(['components'], 'Stores never import a component.'))
	},
	{
		files: ['src/lib/components/ui/**'],
		rules: restrictImports(
			layer(['services', 'components'], 'ui/ components import no other component and no service.')
		)
	},
	{
		files: ['src/lib/components/games/**'],
		rules: restrictImports(
			layer(['services'], 'A game gets everything through GameProps; BlockRunner plays haptics.'),
			{
				regex: '^\\$lib/stores/(?!locale\\.store$)',
				message: 'A game reads only locale.store. See docs/ai/structure.md.'
			},
			{
				regex: '^\\$lib/components/(?!games/|session/TrialTimer\\.svelte$)',
				message: 'A game uses only session/TrialTimer. See docs/ai/structure.md.'
			}
		)
	},
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'node_modules/',
			'.claude/worktrees/',
			'android/',
			'ios/',
			'playwright-report/',
			'test-results/'
		]
	}
);
