const baseConfig = {
    env: { node: true },
    plugins: ['import'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.eslint.json'],
    },
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:import/recommended',
    ],
    rules: {
        'max-len': 'off',
        'linebreak-style': 'off',
        'indent': 'off',
        'react/jsx-indent': ['warn', 4],
        '@typescript-eslint/indent': ['warn', 4],
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
};

const tsConfig = {
    files: ['*.ts', '*.tsx'],
    excludedFiles: ['*.spec.ts', '*.spec.tsx', '*.test.ts', '*.test.tsx'],
    plugins: [
        ...baseConfig.plugins,
        '@typescript-eslint',
    ],
    extends: [
        ...baseConfig.extends,
        'airbnb-typescript',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
        ...baseConfig.rules,
        // disable rules covered by TypesScript compiler
        'import/default': 'off',
        'import/named': 'off',
        'import/namespace': 'off',
        'import/no-named-as-default-member': 'off',
        // disable rules for better local performance
        'import/no-cycle': 'off',
        'import/no-deprecated': 'off',
        'import/no-named-as-default': 'off',
        'import/no-unused-modules': 'off',
    },
    settings: {
        'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: ['./tsconfig.eslint.json'],
            },
        },
    },
};

const specialConfig = {
    files: [
        '**/*.config.js',
        '**/*.config.cjs',
        '**/*.config.mjs',
        '**/*.config.*.js',
        '**/*.config.*.cjs',
        '**/*.config.*.mjs',
    ],
    rules: {
        ...baseConfig.rules,
        'import/no-extraneous-dependencies': 'off',
    },
};

module.exports = {
    root: true,
    ...baseConfig,
    overrides: [
        tsConfig,
        specialConfig,
    ],
};
