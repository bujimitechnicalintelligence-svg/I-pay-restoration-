import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import authConfig from '../firebase-applet-config.json';

// --- CONFIG A: Auth Database (sign-up2-2ab04) ---
export const authFirebaseConfig = authConfig;

const existingApps = getApps();
// Force unique names to ensure we use our specific configs
export const authApp = existingApps.find((a) => a.name === 'authApp') || initializeApp(authFirebaseConfig, 'authApp');
export const auth = getAuth(authApp);
export const authDb = getFirestore(authApp, '(default)');

// --- CONFIG B: Profile Collections Database (collections-1a343) ---
export const profileFirebaseConfig = {
  apiKey: "AIzaSyCR98rf4NojfJemZ-ymDMqnpa54kBeQPRU",
  authDomain: "collections-1a343.firebaseapp.com",
  projectId: "collections-1a343",
  storageBucket: "collections-1a343.firebasestorage.app",
  messagingSenderId: "449017327203",
  appId: "1:449017327203:web:3df5778ac6298093785256",
  measurementId: "G-5BSW2QZF7V",
};

export const profileApp =
  existingApps.find((a) => a.name === 'profileCollections') ||
  initializeApp(profileFirebaseConfig, 'profileCollections');

export const profileAuth = getAuth(profileApp);
export const profileDb = getFirestore(profileApp, '(default)');

// Auto-enable Anonymous Auth session for Config B if needed
export const ensureProfileAuthReady = async (): Promise<boolean> => {
  try {
    if (!profileAuth.currentUser) {
      await signInAnonymously(profileAuth);
    }
    return true;
  } catch (err: any) {
    // If anonymous auth is not enabled in Firebase Console, direct Firestore rules still work
    console.warn('[PROFILE AUTH] Anonymous signIn notice:', err.message);
    return false;
  }
};

// --- CONFIG C: Friends Database (friends-48e2a) ---
export const friendsFirebaseConfig = {
  apiKey: "AIzaSyC-Gsclw__AnLvMoJ9xFgakiMgkTk5d_hc",
  authDomain: "friends-48e2a.firebaseapp.com",
  projectId: "friends-48e2a",
  storageBucket: "friends-48e2a.firebasestorage.app",
  messagingSenderId: "881090392489",
  appId: "1:881090392489:web:58346c4cb1b73555ac94b8",
  measurementId: "G-ZZTPJS399T"
};

export const friendsApp =
  existingApps.find((a) => a.name === 'friendsApp') ||
  initializeApp(friendsFirebaseConfig, 'friendsApp');

export const friendsAuth = getAuth(friendsApp);
export const friendsDb = getFirestore(friendsApp, '(default)');

export const ensureFriendsAuthReady = async (): Promise<boolean> => {
  try {
    if (!friendsAuth.currentUser) {
      console.log('[FRIENDS AUTH] Signing in anonymously...');
      await signInAnonymously(friendsAuth);
    }
    console.log('[FRIENDS AUTH] Anonymous sign-in success, UID:', friendsAuth.currentUser?.uid);
    return true;
  } catch (err: any) {
    console.warn('[FRIENDS AUTH] Anonymous signIn notice:', err.message);
    return false;
  }
};

// Default export db pointing to primary for backward compatibility
export const db = authDb;
