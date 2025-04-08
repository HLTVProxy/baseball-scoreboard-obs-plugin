import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 在 ES Modules 中模擬 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 要構建的組件名稱
const target = process.env.TARGET;

// 所有可用組件
const components = ['ComponentA', 'ComponentB'];

// 創建特定組件的構建配置
const createComponentConfig = (name: string) => {
  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-transform',
        apply: 'build',
        generateBundle(_, bundle) {
          // 處理產生的 HTML 檔案
          Object.keys(bundle).forEach((key) => {
            if (key.endsWith('.html')) {
              const asset = bundle[key];
              if (asset.type === 'asset') {
                let content = asset.source;
                if (typeof content === 'string') {
                  // 將絕對路徑改為相對路徑
                  content = content.replace(
                    /src="\/assets\//g,
                    'src="./assets/'
                  );
                  content = content.replace(
                    /href="\/assets\//g,
                    'href="./assets/'
                  );
                }
              }
            }
          });
        },
      },
    ],
    define: {
      // 替換所有 process.env 的使用
      'process.env': JSON.stringify({}),
      // 如果有特定的環境變數需要提供，可以這樣設定
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      outDir: `dist/${name.toLowerCase()}`,
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, `src/pages/${name}.tsx`),
        name: name,
        formats: ['iife'],
        fileName: () => `${name.toLowerCase()}.js`,
      },
      rollupOptions: {
        // 打包所有依賴，包括React
        external: [],
      },
    },
  });
};

// 如果指定了目標組件，只構建該組件，否則返回默認配置
export default target && components.includes(target)
  ? createComponentConfig(target)
  : createComponentConfig('ComponentA');
