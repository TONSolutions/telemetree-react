import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    target: 'es2015',
    outDir: 'lib',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: true,
    lib: {
      formats: ['es', 'cjs'],
      entry: path.resolve('src/index.ts'),
      name: '@tonsolutions/telemetree-react',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'crypto-js', 'jsencrypt'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'crypto-js': 'CryptoJS',
          'jsencrypt': 'JSEncrypt',
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      format: {
        comments: false,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['crypto-js', 'jsencrypt'],
  },
  resolve: {
    alias: {
      './src': path.resolve(__dirname, 'src'),
    },
  },
})