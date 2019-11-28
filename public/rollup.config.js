import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: 'public/main.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
    ],
}
