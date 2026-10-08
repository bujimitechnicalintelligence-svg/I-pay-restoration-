import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { profileDb, ensureProfileAuthReady } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './firestoreUtils';

export const EMPTY_USER_PROFILE: UserProfile = {
  id: '',
  username: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  avatarUrl: '',
  bio: '',
  
  // Clean empty default identity fields (No fake data)
  hobby: '',
  country: '',
  currentLocation: '',
  location: '',
  lifeStatus: '',
  travel: '',
  experience: '',
  school: '',
  occupation: '',
  
  socialHandle: '',
  socialLinks: [],
  publicPhone: '',
  monetization: 'Free Account',
  website: '',
  
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  watchesCount: 0,
  
  isProfileCompleted: false,
  isEmailVerified: true,
  isPhoneVerified: false,
  walletBalance: 0,
  virtualCard: {
    cardNumber: '•••• •••• •••• ••••',
    cardHolder: '',
    expiryDate: '12/28',
    cvv: '•••',
    isFrozen: false,
    cardType: 'visa',
  },
};

const PROFILE_STORAGE_KEY_PREFIX = 'ipay_cloud_profile_';

export const profileCloudService = {
  /**
   * Fetch user profile from App Database first, fallback to cloud/cache
   */
  async getProfile(email: string): Promise<UserProfile | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. App Database (Native backend)
    try {
      const res = await fetch(`/api/profile/get?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const merged: UserProfile = {
            ...EMPTY_USER_PROFILE,
            ...data.profile,
            email: cleanEmail,
            id: data.profile.id || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            isProfileCompleted: data.profile.isProfileCompleted ?? true,
          };
          try {
            localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${cleanEmail}`, JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
    } catch (err: any) {
      console.warn('[APP DATABASE PROFILE FETCH ERROR]', err.message);
    }

    // 2. Fallback to Cloud Firestore
    try {
      await ensureProfileAuthReady();
      const docRef = doc(profileDb, 'profiles', cleanEmail);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<UserProfile>;
        console.log(`[CLOUD PROFILE B] Successfully fetched profile for ${cleanEmail} from collections-1a343`);
        
        const merged: UserProfile = {
          ...EMPTY_USER_PROFILE,
          ...data,
          email: cleanEmail,
          id: data.id || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          isProfileCompleted: data.isProfileCompleted ?? true,
        };

        // Cache locally for the active user session
        try {
          localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${cleanEmail}`, JSON.stringify(merged));
        } catch {}

        return merged;
      }
    } catch (err: any) {
      console.warn(`[CLOUD PROFILE B FETCH ERROR] ${err.message}`);
    }

    // 3. If neither App Database nor Cloud has this user, explicitly remove any stale local cache
    try {
      localStorage.removeItem(`${PROFILE_STORAGE_KEY_PREFIX}${cleanEmail}`);
      localStorage.removeItem(`ipay_cloud_profile_${cleanEmail}`);
    } catch {}

    return null;
  },

  /**
   * Completely wipe out all local cached profiles, sessions, and accounts from the browser
   */
  wipeAllLocalProfileCache(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('ipay_') ||
            key.toLowerCase().includes('profile') ||
            key.toLowerCase().includes('account') ||
            key.toLowerCase().includes('user') ||
            key.toLowerCase().includes('cached') ||
            key.toLowerCase().includes('chat') ||
            key.toLowerCase().includes('friend'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      try {
        sessionStorage.clear();
      } catch {}
      console.log('[CACHE WIPE] Successfully purged all local cached profiles and accounts:', keysToRemove);
    } catch (e) {
      console.warn('[CACHE WIPE ERROR]', e);
    }
  },

  /**
   * Clear local profile cache for a specific user
   */
  clearLocalProfile(email: string): void {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    try {
      localStorage.removeItem(`${PROFILE_STORAGE_KEY_PREFIX}${cleanEmail}`);
      localStorage.removeItem(`ipay_cloud_profile_${cleanEmail}`);
      localStorage.removeItem('ipay_user_profile_v2');
      localStorage.removeItem(`ipay_chats_${cleanEmail}`);
      localStorage.removeItem(`ipay_friendships_${cleanEmail}`);
      if (localStorage.getItem('ipay_current_user_email') === cleanEmail) {
        localStorage.removeItem('ipay_current_user_email');
      }
      if (localStorage.getItem('ipay_remembered_email') === cleanEmail) {
        localStorage.removeItem('ipay_remembered_email');
        localStorage.removeItem('ipay_remember_me_active');
      }
    } catch {}
  },

  /**
   * Save user profile to App Database (Native backend) and local cache
   */
  async saveProfile(email: string, profileData: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    if (!email) return { success: false, error: 'Email is required' };
    const cleanEmail = email.trim().toLowerCase();

    const payload = {
      ...profileData,
      email: cleanEmail,
      id: profileData.id || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      isProfileCompleted: true,
      updatedAt: Date.now(),
    };

    // 1. Save to local cache immediately for fast owner experience
    try {
      localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${cleanEmail}`, JSON.stringify(payload));
      localStorage.setItem('ipay_user_profile_v2', JSON.stringify(payload));
    } catch {}

    // 2. Save directly to App Database on server
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, profile: payload }),
      });
      if (res.ok) {
        console.log(`[APP DATABASE] Successfully saved profile for ${cleanEmail} to native app database!`);
      }
    } catch (err: any) {
      console.warn('[APP DATABASE SAVE WARNING]', err.message);
    }

    // 3. Background mirror to Firestore (non-blocking)
    try {
      await ensureProfileAuthReady();
      const docRef = doc(profileDb, 'profiles', cleanEmail);
      await setDoc(docRef, payload, { merge: true });
    } catch (err: any) {
      console.warn('[CLOUD PROFILE B MIRROR NOTICE]', err.message);
    }

    return { success: true };
  },

  /**
   * Check whether this email has already completed their profile setup in Database B
   */
  async checkProfileCompleted(email: string): Promise<boolean> {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();

    const remoteProfile = await this.getProfile(cleanEmail);
    if (!remoteProfile) {
      this.clearLocalProfile(cleanEmail);
      return false;
    }
    return !!remoteProfile.isProfileCompleted;
  },

  /**
   * Fetch all registered public profiles strictly from App Database
   */
  async getAllPublicProfiles(): Promise<UserProfile[]> {
    try {
      const res = await fetch('/api/profile/all');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.profiles)) {
          return data.profiles.map((d: any) => ({
            ...EMPTY_USER_PROFILE,
            ...d,
            email: d.email,
            id: d.id || `usr_${d.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          }));
        }
      }
    } catch (err: any) {
      console.warn('[APP DATABASE PROFILES LIST ERROR]', err.message);
    }
    return [];
  },
};
