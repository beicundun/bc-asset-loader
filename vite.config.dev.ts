import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // demo/ をルートとして開発サーバーを起動する
  root: resolve(__dirname, 'demo'),
  // demo/ 配下の public/ を静的ファイルとして提供する
  publicDir: resolve(__dirname, 'demo/public'),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // ライブラリ名でインポートしたとき src/index.ts を直接参照する
      'bc-asset-loader': resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    open: true,
  },
})
