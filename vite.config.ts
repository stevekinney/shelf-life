import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

const shouldEmitBundleStats = process.env.BUNDLE_STATS === '1';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		...(shouldEmitBundleStats
			? [
					visualizer({
						filename: path.resolve('build/stats.html'),
						template: 'treemap',
						gzipSize: true,
						brotliSize: true,
						emitFile: false
					}),
					visualizer({
						filename: path.resolve('build/stats.json'),
						template: 'raw-data',
						gzipSize: true,
						brotliSize: true,
						emitFile: false
					})
				]
			: [])
	],
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined,
	test: {
		include: ['src/**/*.test.ts']
	}
});
