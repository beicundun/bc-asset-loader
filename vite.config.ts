import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/index.ts'],
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BcAssetLoader',
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => {
        if (format === 'iife') return 'bc-asset-loader.js';
        return `bc-asset-loader.${format}.js`;
      },
    },
    rollupOptions: {
      // バンドルに含めたくない外部依存をここに列挙
      external: [],
      output: {
        banner: () => {
          const year = new Date().getFullYear()
          return [
            '/*!',
            ` * ${pkg.name} v${pkg.version}`,
            ` * (c) ${year} ${pkg.author}`,
            ` * Released under the ${pkg.license} License`,
            ' */',
          ].join('\n')
        },
      },
    },
  },
})
