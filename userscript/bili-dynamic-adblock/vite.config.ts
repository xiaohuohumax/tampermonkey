import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        externalGlobals: {
          sweetalert: cdn.unpkg('swal', 'dist/sweetalert.min.js'),
        },
      },
      userscript: {
        icon: 'https://static.hdslb.com/mobile/img/512.png',
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
