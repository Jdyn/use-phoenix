import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' assert { type: 'json' };

const isDev = process.env.BUILD !== 'production';

const cjs = {
	file: pkg.main,
	format: 'cjs',
	exports: 'named',
	sourcemap: true,
	plugins: !isDev && [terser()]
};

const esm = {
	file: pkg.module,
	format: 'esm',
	exports: 'named',
	sourcemap: true
};

const extensions = ['.js', '.ts', '.tsx', '.json'];

const plugins = [
  typescript(),
	resolve({ extensions }),
	commonjs(),
	babel({ exclude: 'node_modules/**', extensions }),
	replace({
		'preventAssignment': true,
		'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
	})
].filter(Boolean);

export default {
	input: 'src/index.ts',
	output: isDev ? [esm] : [cjs, esm],
	plugins,
	external: Object.keys(pkg.peerDependencies)
};
