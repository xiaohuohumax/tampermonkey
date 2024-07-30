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
            'https://message.bilibili.com/*',
            'https://space.bilibili.com/*',
            // 适配中
            'https://live.bilibili.com/*',
            'https://game.bilibili.com/*',
            // 未处理
            'https://account.bilibili.com/*',
            'https://manga.bilibili.com/*',
            'https://link.bilibili.com/*'
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
