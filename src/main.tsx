import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from 'react-router-dom';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import '@codegouvfr/react-dsfr/main.css';
import './index.css';
import App from './App.tsx';

startReactDsfr({ defaultColorScheme: 'system', Link });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
