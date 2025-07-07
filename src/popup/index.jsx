import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('React entry point loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created, rendering App...');
  root.render(<App />);
} else {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found!</div>';
}
