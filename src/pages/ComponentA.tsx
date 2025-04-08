import React from 'react';
import ReactDOM from 'react-dom/client';
import ComponentA from '../components/ComponentA';

// 擴展 Window 接口以包含 mountComponentA
declare global {
  interface Window {
    mountComponentA?: () => void;
  }
}

// 自動掛載函數
function mount() {
  const container =
    document.getElementById('component-a') || document.createElement('div');
  if (!container.id) {
    container.id = 'component-a';
    document.body.appendChild(container);
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ComponentA />
    </React.StrictMode>
  );
}

// 當頁面加載完成自動掛載
if (document.readyState === 'complete') {
  mount();
} else {
  window.addEventListener('DOMContentLoaded', mount);
}

// 也允許手動掛載
window.mountComponentA = mount;
