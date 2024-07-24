import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        externalGlobals: {
          sweetalert2: cdn.jsdelivr('Swal'),
        },
      },
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        license: 'MIT',
        match: [
          'https://t.bilibili.com/*',
          'https://space.bilibili.com/*'
        ],
      },
    }),
  ],
});
