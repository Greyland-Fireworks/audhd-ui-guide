import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../../../skins/skins.css';
import '../../shared/tokens.css';
import './styles.css';

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
