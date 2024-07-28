import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      monkey({
        entry: 'src/main.ts',
        userscript: {
          icon: 'https://static.hdslb.com/mobile/img/512.png',
          namespace: 'npm/vite-plugin-monkey',
          license: 'MIT',
          match: [
            // 已经适配
            'https://www.bilibili.com/*',
            'https://t.bilibili.com/*',
            'https://show.bilibili.com/*',
            // 适配中
            'https://space.bilibili.com/*',
            'https://live.bilibili.com/*',
            'https://game.bilibili.com/*'
          ],
          'run-at': mode !== 'production'
            ? 'document-idle'
            : undefined
        },
        build: {
          cssSideEffects() {
            return (css) => {
              const s = document.createElement('style');
              s.textContent = css;
              document.body.prepend(s);
            };
          },
        }
      }),
    ],
  };
});
