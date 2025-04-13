import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import path from 'path';

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
        name: 'custom-build-structure',
        apply: 'build',
        // 構建開始前準備工作
        buildStart() {
          console.log(`開始構建 ${name}...`);
          // 確保 dist/scripts 目錄存在
          const scriptsDir = path.resolve(__dirname, 'dist/scripts');
          if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
          }
        },
        // 構建完成後生成需要的檔案結構
        writeBundle(_, bundle) {
          console.log(`構建完成，生成 ${name} 相關檔案`);

          // 找到入口 JS 檔案
          const jsEntryFile = Object.entries(bundle).find(
            ([, chunk]) =>
              chunk.type === 'chunk' && (chunk as { isEntry: boolean }).isEntry
          );

          if (!jsEntryFile) {
            console.error(`未找到 ${name} 的入口 JS 檔案`);
            return;
          }

          const [, chunk] = jsEntryFile;
          const jsContent = (chunk as { code: string }).code;

          // 1. 將 JS 寫入到 scripts 目錄
          const jsOutputPath = path.resolve(
            __dirname,
            `dist/scripts/${name.toLowerCase()}.js`
          );
          fs.writeFileSync(jsOutputPath, jsContent);
          console.log(`已生成：${jsOutputPath}`);

          // 2. 創建對應的 HTML 檔案
          const htmlTemplate = `
          <!DOCTYPE html>
          <html lang="zh-TW">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${name}</title>
          </head>
          <body>
            <div id="root"></div>
            <script src="./scripts/${name.toLowerCase()}.js"></script>
          </body>
          </html>`;

          const htmlOutputPath = path.resolve(
            __dirname,
            `dist/${name.toLowerCase()}.html`
          );
          fs.writeFileSync(htmlOutputPath, htmlTemplate);
          console.log(`已生成：${htmlOutputPath}`);

          // 3. 清理不需要的文件和目錄
          try {
            // 移除臨時 JS 文件
            const tempJsPath = path.resolve(
              __dirname,
              `dist/temp-${name.toLowerCase()}.js`
            );
            if (fs.existsSync(tempJsPath)) {
              fs.unlinkSync(tempJsPath);
              console.log(`已移除臨時文件：${tempJsPath}`);
            }

            // 移除組件子目錄
            const componentDir = path.resolve(
              __dirname,
              `dist/${name.toLowerCase()}`
            );
            if (
              fs.existsSync(componentDir) &&
              fs.statSync(componentDir).isDirectory()
            ) {
              fs.rmSync(componentDir, { recursive: true, force: true });
              console.log(`已移除不必要的目錄：${componentDir}`);
            }
          } catch (error) {
            console.error('清理文件時發生錯誤:', error);
          }
        },
        // 在所有構建都完成後清理目錄
        closeBundle() {
          // 使用延時確保所有寫入操作完成
          setTimeout(() => {
            try {
              // 確保所有組件子目錄都被刪除
              for (const comp of components) {
                const componentDir = path.resolve(
                  __dirname,
                  `dist/${comp.toLowerCase()}`
                );
                if (
                  fs.existsSync(componentDir) &&
                  fs.statSync(componentDir).isDirectory()
                ) {
                  fs.rmSync(componentDir, { recursive: true, force: true });
                  console.log(`最終清理：已移除目錄 ${componentDir}`);
                }
              }
              console.log('目錄清理完成');
            } catch (error) {
              console.error('最終清理時發生錯誤:', error);
            }
          }, 1000); // 延遲1秒執行，確保之前的所有操作已完成
        },
      },
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: false, // 避免刪除其他組件的檔案
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
      },
      lib: {
        entry: resolve(__dirname, `src/pages/${name}.tsx`),
        name: name,
        formats: ['iife'],
        fileName: () => `temp-${name.toLowerCase()}.js`, // 臨時檔名，最後會移動到 scripts 目錄
      },
      rollupOptions: {
        external: [], // 不排除任何依賴，全部打包
      },
    },
    define: {
      // 定義 process.env 以避免 'process is not defined' 錯誤
      'process.env': JSON.stringify({}),
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  });
};

// 如果指定了目標組件，只構建該組件，否則建構索引頁面
export default target && components.includes(target)
  ? createComponentConfig(target)
  : createComponentConfig('ComponentA');
