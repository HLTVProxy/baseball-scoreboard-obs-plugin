// scripts/create-index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 ES Modules 中模擬 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 創建一個主索引頁面
const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React 元件展示</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1 { color: #333; }
    .component-list { list-style: none; padding: 0; }
    .component-list li { margin: 10px 0; }
    .component-list a { 
      display: inline-block;
      padding: 10px 15px;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .component-list a:hover { background: #45a049; }
  </style>
</head>
<body>
  <h1>Baseball Scoreboard Component List</h1>
  <ul class="component-list">
    <li><a href="./componenta.html">Component A</a></li>
    <li><a href="./componentb.html">Component B</a></li>
  </ul>
</body>
</html>
`;

// 為每個元件創建一個示例HTML
const createComponentHTML = (name) => `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
  </style>
</head>
<body>
  <div id="component-${name.toLowerCase()}"></div>
  <script src="./${name.toLowerCase()}.js"></script>
</body>
</html>
`;

// 寫入主索引頁面
fs.writeFileSync(path.resolve(__dirname, '../dist/index.html'), html);

// 為每個元件創建示例頁面，但放在根目錄下
['ComponentA', 'ComponentB'].forEach((comp) => {
  // 確保 scripts 目錄存在 (以防萬一)
  const scriptsDir = path.resolve(__dirname, '../dist/scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  // 創建元件的 HTML 檔案，直接放在 dist 根目錄中
  const componentHtml = `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${comp}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./scripts/${comp.toLowerCase()}.js"></script>
  </body>
  </html>
  `;

  fs.writeFileSync(
    path.resolve(__dirname, `../dist/${comp.toLowerCase()}.html`),
    componentHtml
  );
});

console.log('所有頁面已生成完成！');
