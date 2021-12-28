import { babel } from '@rollup/plugin-babel'

export default [
    {
        input: 'index.js',
        external: ['zustand', 'immer', 'zustand/shallow', 'crypto', 'react'],
        output: {
            dir: 'dist/esm',
            format: 'esm'
        },
        plugins: [
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
        ]
    },
    {
        input: 'index.js',
        external: ['zustand', 'immer', 'zustand/shallow', 'crypto', 'react'],
        output: {
            dir: 'dist',
            format: 'cjs',
            exports: 'named'
        },
        plugins: [
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
        ]
    },
    {
        input: 'index.js',
        external: ['zustand', 'immer', 'zustand/shallow', 'crypto', 'react'],
        output: {
            dir: 'dist/umd',
            format: 'umd',
            name: 'zusform',
            exports: 'named',
            globals: {
                'zustand': 'create',
                'zustand/shallow': 'shallow',
                'immer': 'produce',
		'crypto': 'crypto',
		'react': 'react'
            }
        },
        plugins: [
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled'
            }),
        ]
    }
]
