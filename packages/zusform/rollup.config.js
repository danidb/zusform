import { babel } from '@rollup/plugin-babel'

export default [
    {
        input: 'index.js',
        external: ['zustand', 'immer', 'zustand/shallow'],
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
        external: ['zustand', 'immer', 'zustand/shallow'],
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
        external: ['zustand', 'immer', 'zustand/shallow'],
        output: {
            dir: 'dist/umd',
            format: 'umd',
            name: 'zusform',
            exports: 'named',
            globals: {
                'zustand': 'create',
                'zustand/shallow': 'shallow',
                'immer': 'produce'
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