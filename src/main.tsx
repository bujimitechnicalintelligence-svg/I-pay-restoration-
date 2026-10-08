import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { profileCloudService } from './services/profileCloudService';

// Ensure immediate wipe of any old local cached profiles, sessions, and accounts from previous runs
const PURGE_MARKER = 'ipay_profile_cache_purged_v3';
try {
  if (!localStorage.getItem(PURGE_MARKER)) {
    profileCloudService.wipeAllLocalProfileCache();
    localStorage.setItem(PURGE_MARKER, 'true');
  }
} catch (e) {
  console.warn('Initial cache purge error:', e);
}

createRoot(document.getElementById('root')!).render(<App />);
