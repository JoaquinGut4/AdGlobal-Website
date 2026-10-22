import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SiteDataProvider } from './hooks/useSiteData';
import './index.css';

document.documentElement.classList.add('js');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteDataProvider>
      <App />
    </SiteDataProvider>
  </StrictMode>
);
