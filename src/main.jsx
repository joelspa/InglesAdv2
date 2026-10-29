import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
