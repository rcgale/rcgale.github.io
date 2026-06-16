import React from 'react';
import ReactDOM from 'react-dom/client';
import PhonologicViewer from "@phonologic/viewer";
import '@phonologic/viewer/dist/viewer.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <PhonologicViewer />
  </React.StrictMode>
);
