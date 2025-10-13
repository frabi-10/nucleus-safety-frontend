import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import QRCodeGenerator from './QRCodeGenerator';

// Check if URL is /qr-codes
const isQRPage = window.location.pathname === '/qr-codes';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isQRPage ? <QRCodeGenerator /> : <App />}
  </React.StrictMode>
);