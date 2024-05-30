import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './components/popup/Popup';

const root = document.createElement("div")
document.body.appendChild(root)
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);