
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Performans optimizasyonu: React Strict Mode'u production'da kapat
const container = document.getElementById("root");
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);

// Production'da console.log'ları temizle
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

root.render(
  import.meta.env.PROD ? <App /> : <React.StrictMode><App /></React.StrictMode>
);
