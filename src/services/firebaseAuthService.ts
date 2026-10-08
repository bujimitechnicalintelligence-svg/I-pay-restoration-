import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, friendsDb, ensureFriendsAuthReady } from '../firebase';
import { UserProfile } from '../types';
import { profileCloudService } from './profileCloudService';
import { handleFirestoreError, OperationType } from './firestoreUtils';

export interface FirebaseVerifyResult {
  success: boolean;
  reason: 'MATCH' | 'WRONG_PASSWORD' | 'NOT_FOUND' | 'ERROR';
  error?: string;
  message?: string;
  account?: {
    name?: string;
    username?: string;
    email?: string;
    followers?: string;
    profile?: Partial<UserProfile>;
  };
}

// Timeout helper to prevent hanging on network stalls
const executeWithSafetyTimeout = <T>(promise: Promise<T>, ms: number, onTimeoutValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(onTimeoutValue), ms)),
  ]);
};

export const firebaseAuthService = {
  // Helper to mirror Auth users to Firestore so they show in lists
  async syncAuthUserToFirestore(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const docRef = doc(db, 'users', cleanEmail);
      await setDoc(docRef, {
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        name: cleanEmail.split('@')[0],
        createdAt: Date.now(),
        source: 'forced_auth_sync'
      }, { merge: true });

      await fetch('/api/auth/register-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          fullName: cleanEmail.split('@')[0],
          password: '',
        }),
      });
    } catch (err) {
      console.warn('Sync auth user error:', err);
    }
  },

  /**
   * Deep inquiry checking Real Database:
   * Optimized for minimal reads.
   */
  async checkAccountExists(identifier: string): Promise<{
    exists: boolean;
    email?: string;
    username?: string;
    account?: Partial<UserProfile>;
    source?: string;
    error?: string;
  }> {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    if (!cleanId) return { exists: false };

    // 1. Native App Database check (Server backend)
    try {
      const res = await fetch('/api/auth/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          return {
            exists: true,
            email: data.account?.email || (cleanId.includes('@') ? cleanId : `${cleanId}@gmail.com`),
            username: data.account?.username || cleanId.split('@')[0],
            account: data.account as any,
            source: 'app_native_database',
          };
        }
      }
    } catch (err: any) {
      console.warn('[APP DATABASE CHECK ERROR]', err.message);
    }

    const emailToCheck = cleanId.includes('@') ? cleanId : `${cleanId}@gmail.com`;

    // 2. Fallback to Firestore Document Read
    try {
      const docRef = doc(db, 'users', emailToCheck);
      const docSnap = await executeWithSafetyTimeout(getDoc(docRef), 2000, null);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        return {
          exists: true,
          email: data.email || emailToCheck,
          username: data.username || emailToCheck.split('@')[0],
          account: data as any,
          source: 'firestore_database',
        };
      }
    } catch (err: any) {
      console.warn('[FIRESTORE CHECK NOTICE]', err.message);
    }

    // 3. Fallback Auth Check
    if (emailToCheck.includes('@')) {
      try {
        const methods = await executeWithSafetyTimeout(fetchSignInMethodsForEmail(auth, emailToCheck), 2000, []);
        if (methods && methods.length > 0) {
          await this.syncAuthUserToFirestore(emailToCheck);
          return { exists: true, email: emailToCheck, source: 'firebase_auth' };
        }
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use' || err.code === 'auth/account-exists-with-different-credential') {
          await this.syncAuthUserToFirestore(emailToCheck);
          return { exists: true, email: emailToCheck, source: 'firebase_auth' };
        }
        if (err.code === 'auth/too-many-requests' || err.code === 'auth/internal-error') {
          return { exists: false, error: 'System busy. Please try again later.' };
        }
      }
    }

    return { exists: false };
  },

  /**
   * Real Credential Verification
   * Checks Native App Database first.
   */
  async verifyCredentials(
    identifier: string,
    password: string
  ): Promise<FirebaseVerifyResult> {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId || !password) {
      return { success: false, reason: 'NOT_FOUND', error: 'Please enter both email and password.' };
    }

    // 1. Native App Database Verification (Server backend - zero 3rd party rules)
    try {
      const res = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      });
      const data = await res.json();
      if (data.reason === 'MATCH') {
        return {
          success: true,
          reason: 'MATCH',
          account: {
            email: data.account?.email || cleanId,
            name: data.account?.fullName || data.account?.username || cleanId.split('@')[0],
            username: data.account?.username || cleanId.split('@')[0],
          },
        };
      } else if (data.reason === 'WRONG_PASSWORD') {
        return {
          success: false,
          reason: 'WRONG_PASSWORD',
          error: data.error || '⚠️ Incorrect password.',
          account: data.account,
        };
      }
    } catch (err: any) {
      console.warn('[APP DATABASE VERIFY ERROR]', err.message);
    }

    const emailToAuth = cleanId.includes('@') ? cleanId : `${cleanId}@gmail.com`;

    // 2. Fallback to Firestore
    try {
      const docRef = doc(db, 'users', emailToAuth);
      const docSnap = await executeWithSafetyTimeout(getDoc(docRef), 2000, null);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data.password && data.password !== password) {
          return {
            success: false,
            reason: 'WRONG_PASSWORD',
            error: '⚠️ Incorrect password.',
            account: { email: emailToAuth, name: data.fullName || emailToAuth.split('@')[0] },
          };
        } else if (data.password === password) {
          return { success: true, reason: 'MATCH', account: { email: emailToAuth, name: data.fullName || emailToAuth.split('@')[0] } };
        }
      }
    } catch {}

    // 3. Fallback to Firebase Auth
    try {
      const userCredential = await executeWithSafetyTimeout(signInWithEmailAndPassword(auth, emailToAuth, password), 2000, null);
      if (userCredential && userCredential.user) {
        await this.syncAuthUserToFirestore(emailToAuth);
        return { success: true, reason: 'MATCH', account: { email: emailToAuth, name: userCredential.user.displayName || emailToAuth.split('@')[0] } };
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        await this.syncAuthUserToFirestore(emailToAuth);
        return { success: false, reason: 'WRONG_PASSWORD', error: '⚠️ Incorrect password.' };
      }
    }

    return { success: false, reason: 'NOT_FOUND', error: `❌ Account "${emailToAuth}" not found. Please Sign Up.` };
  },

  /**
   * FRIEND MANAGEMENT: Request & Approval Logic
   */
  async sendFriendRequest(fromEmail: string, toEmail: string): Promise<boolean> {
    if (!fromEmail || !toEmail || fromEmail.toLowerCase() === toEmail.toLowerCase()) return false;
    const cleanFrom = fromEmail.trim().toLowerCase();
    const cleanTo = toEmail.trim().toLowerCase();
    const reqId = [cleanFrom, cleanTo].sort().join('_');

    // 1. Check local cache to prevent duplicate requests
    try {
      const savedKey = `ipay_friendships_${cleanFrom}`;
      const existing = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const isAlready = existing.find((f: any) => f.id === reqId);
      if (isAlready && (isAlready.status === 'pending' || isAlready.status === 'approved')) {
        return false;
      }
    } catch {}

    const payload = {
      from: cleanFrom,
      to: cleanTo,
      status: 'pending' as const,
      timestamp: Date.now()
    };

    // 2. Save in Native App Database (server)
    try {
      await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: cleanFrom, to: cleanTo }),
      });
    } catch (err: any) {
      console.warn('[APP DATABASE FRIEND REQUEST WARNING]', err.message);
    }

    // 3. Save to localStorage immediately for the sender account
    try {
      const savedKey = `ipay_friendships_${cleanFrom}`;
      const existing = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const filtered = existing.filter((f: any) => f.id !== reqId);
      filtered.push({ id: reqId, ...payload });
      localStorage.setItem(savedKey, JSON.stringify(filtered));
    } catch {}

    // 4. Background mirror to Firestore
    try {
      await ensureFriendsAuthReady();
      const docRef = doc(friendsDb, 'friend_requests', reqId);
      await setDoc(docRef, payload, { merge: true });
    } catch {}

    try {
      const primaryDocRef = doc(db, 'friend_requests', reqId);
      await setDoc(primaryDocRef, payload, { merge: true });
    } catch {}

    return true;
  },

  async approveFriendRequest(fromEmail: string, toEmail: string): Promise<boolean> {
    const cleanFrom = fromEmail.trim().toLowerCase();
    const cleanTo = toEmail.trim().toLowerCase();
    const reqId = [cleanFrom, cleanTo].sort().join('_');

    const updatePayload = {
      status: 'approved' as const,
      approvedAt: Date.now()
    };

    // 1. Native App Database approve
    try {
      await fetch('/api/friends/approve-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: cleanFrom, to: cleanTo }),
      });
    } catch (err: any) {
      console.warn('[APP DATABASE APPROVE WARNING]', err.message);
    }

    // 2. Immediately update localStorage for receiver
    try {
      const savedKey = `ipay_friendships_${cleanTo}`;
      const existing = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const updated = existing.map((f: any) => f.id === reqId ? { ...f, ...updatePayload } : f);
      if (!updated.some((f: any) => f.id === reqId)) {
        updated.push({ id: reqId, from: cleanFrom, to: cleanTo, ...updatePayload });
      }
      localStorage.setItem(savedKey, JSON.stringify(updated));
    } catch {}

    // 3. Background mirror
    try {
      await ensureFriendsAuthReady();
      const docRef = doc(friendsDb, 'friend_requests', reqId);
      await setDoc(docRef, updatePayload, { merge: true });
    } catch {}

    try {
      const primaryDocRef = doc(db, 'friend_requests', reqId);
      await setDoc(primaryDocRef, updatePayload, { merge: true });
    } catch {}

    return true;
  },

  async getFriendshipStatus(email1: string, email2: string): Promise<'none' | 'pending' | 'approved'> {
    if (!email1 || !email2) return 'none';
    const clean1 = email1.trim().toLowerCase();
    const clean2 = email2.trim().toLowerCase();
    const reqId = [clean1, clean2].sort().join('_');

    // 1. Check local storage first
    try {
      const savedKey = `ipay_friendships_${clean1}`;
      const cached = JSON.parse(localStorage.getItem(savedKey) || '[]');
      const item = cached.find((f: any) => f.id === reqId);
      if (item?.status === 'approved') return 'approved';
      if (item?.status === 'pending') return 'pending';
    } catch {}

    // 2. Check remote databases
    try {
      const docSnap = await getDoc(doc(friendsDb, 'friend_requests', reqId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'approved') return 'approved';
        if (data.status === 'pending') return 'pending';
      }
    } catch {}

    try {
      const docSnap = await getDoc(doc(db, 'friend_requests', reqId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'approved') return 'approved';
        if (data.status === 'pending') return 'pending';
      }
    } catch {}

    return 'none';
  },

  async getPendingRequests(email: string) {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();
    try {
      const q = query(collection(friendsDb, 'friend_requests'), where('to', '==', cleanEmail), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch { return []; }
  },

  async getAllMyFriendships(email: string) {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();
    const savedKey = `ipay_friendships_${cleanEmail}`;

    // Account isolation: retrieve local friendships for this specific email
    let localFriendships: any[] = [];
    try {
      const cached = localStorage.getItem(savedKey);
      if (cached) localFriendships = JSON.parse(cached);
    } catch {}

    let remoteList: any[] = [];

    // 1. Fetch from Native App Database (server)
    try {
      const res = await fetch(`/api/friends/all?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.friendships)) {
          remoteList = [...remoteList, ...data.friendships];
        }
      }
    } catch (err: any) {
      console.warn('[APP DATABASE FRIENDSHIPS ERROR]', err.message);
    }

    // 2. Fallback to remote Firestore if available
    try {
      await ensureFriendsAuthReady();
      const qFrom = query(collection(friendsDb, 'friend_requests'), where('from', '==', cleanEmail));
      const qTo = query(collection(friendsDb, 'friend_requests'), where('to', '==', cleanEmail));
      const [snapFrom, snapTo] = await Promise.all([getDocs(qFrom), getDocs(qTo)]);
      const fList = [...snapFrom.docs, ...snapTo.docs].map(d => ({ id: d.id, ...d.data() }));
      remoteList = [...remoteList, ...fList];
    } catch {}

    try {
      const qFrom = query(collection(db, 'friend_requests'), where('from', '==', cleanEmail));
      const qTo = query(collection(db, 'friend_requests'), where('to', '==', cleanEmail));
      const [snapFrom, snapTo] = await Promise.all([getDocs(qFrom), getDocs(qTo)]);
      const primaryList = [...snapFrom.docs, ...snapTo.docs].map(d => ({ id: d.id, ...d.data() }));
      remoteList = [...remoteList, ...primaryList];
    } catch {}

    // Merge and enforce account isolation
    const mergedMap = new Map<string, any>();
    localFriendships.forEach(f => {
      if (f.from?.toLowerCase() === cleanEmail || f.to?.toLowerCase() === cleanEmail) {
        mergedMap.set(f.id, f);
      }
    });
    remoteList.forEach(f => {
      if (f.from?.toLowerCase() === cleanEmail || f.to?.toLowerCase() === cleanEmail) {
        mergedMap.set(f.id, f);
      }
    });

    const finalResult = Array.from(mergedMap.values());
    try {
      localStorage.setItem(savedKey, JSON.stringify(finalResult));
    } catch {}

    return finalResult;
  },

  /**
   * Real-time subscription to friendships
   */
  subscribeToFriendships(email: string, callback: (friendships: any[]) => void) {
    if (!email) return () => {};
    const cleanEmail = email.trim().toLowerCase();
    
    console.log('[DEBUG] Setting up snapshot listener for:', cleanEmail);
    
    // We listen to both directions
    const qFrom = query(collection(friendsDb, 'friend_requests'), where('from', '==', cleanEmail));
    const qTo = query(collection(friendsDb, 'friend_requests'), where('to', '==', cleanEmail));

    let fromData: any[] = [];
    let toData: any[] = [];

    const update = () => {
      const all = [...fromData, ...toData];
      const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
      // Account isolation: only deliver if user is participant
      const isolated = unique.filter((item: any) => 
        item.from?.toLowerCase() === cleanEmail || item.to?.toLowerCase() === cleanEmail
      );
      callback(isolated);
    };

    let unsubFrom = () => {};
    let unsubTo = () => {};

    try {
      unsubFrom = onSnapshot(qFrom, (snap: any) => {
        console.log('[DEBUG] Received update from qFrom');
        fromData = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        update();
      }, (err) => {
        console.warn('[DEBUG] Silently ignoring error in qFrom listener:', err.message);
      });
    } catch {}

    try {
      unsubTo = onSnapshot(qTo, (snap: any) => {
        console.log('[DEBUG] Received update from qTo');
        toData = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        update();
      }, (err) => {
        console.warn('[DEBUG] Silently ignoring error in qTo listener:', err.message);
      });
    } catch {}

    return () => {
      unsubFrom();
      unsubTo();
    };
  },

  /**
   * Real registration of user into Native App Database
   * Saves Email, Password, and Profile information in app database!
   */
  async registerAccount(userData: {
    username?: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    fullName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = userData.email.trim().toLowerCase();

    // 1. Primary: Save directly to Native App Database (server)
    try {
      const res = await fetch('/api/auth/register-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          username: userData.username || cleanEmail.split('@')[0],
          fullName: userData.fullName || userData.username || cleanEmail.split('@')[0],
          password: userData.password || '',
          phoneNumber: userData.phoneNumber || '',
        }),
      });
      if (res.ok) {
        console.log(`[APP DATABASE] Successfully registered ${cleanEmail} in native database.`);
      }
    } catch (backendErr) {
      console.warn('[APP DATABASE REGISTRATION NOTICE]', backendErr);
    }

    // 2. Also save initial profile in Native App Database
    try {
      await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          username: userData.username || cleanEmail.split('@')[0],
          fullName: userData.fullName || userData.username || cleanEmail.split('@')[0],
          phoneNumber: userData.phoneNumber || '',
          isProfileCompleted: true,
        }),
      });
    } catch {}

    // 3. Background mirror to Firebase Auth / Firestore (non-blocking)
    try {
      if (userData.password) {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, userData.password);
        } catch {}
      }

      const docRef = doc(db, 'users', cleanEmail);
      await setDoc(
        docRef,
        {
          email: cleanEmail,
          password: userData.password || '',
          username: userData.username || cleanEmail.split('@')[0],
          source: 'new_registration'
        },
        { merge: true }
      );
    } catch {}

    return { success: true };
  },

  /**
   * Save UserProfile to App Database first, then mirror
   */
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    if (!profile || !profile.email) return false;
    const cleanEmail = profile.email.trim().toLowerCase();

    // 1. Save in Native App Database
    try {
      await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, profile }),
      });
    } catch (err: any) {
      console.warn('[APP DATABASE SAVE PROFILE WARNING]', err.message);
    }

    // 2. Local storage save
    try {
      localStorage.setItem(`ipay_cloud_profile_${cleanEmail}`, JSON.stringify(profile));
      localStorage.setItem('ipay_user_profile_v2', JSON.stringify(profile));
    } catch {}

    // 3. Background mirror to Firestore
    try {
      const docRef = doc(db, 'users', cleanEmail);
      await setDoc(docRef, { ...profile, updatedAt: Date.now() }, { merge: true });
    } catch {}

    return true;
  },

  /**
   * Load UserProfile from App Database first, fallback to Firestore
   */
  async loadUserProfile(email: string): Promise<UserProfile | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Native App Database
    try {
      const res = await fetch(`/api/profile/get?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          return data.profile as UserProfile;
        }
      }
    } catch {}

    // 2. Firestore fallback
    try {
      const docRef = doc(db, 'users', cleanEmail);
      const docSnap = await executeWithSafetyTimeout(getDoc(docRef), 1500, null);
      if (docSnap && docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch {}

    // 3. Not found anywhere - wipe any stale local cache for this email
    try {
      localStorage.removeItem(`ipay_cloud_profile_${cleanEmail}`);
    } catch {}

    return null;
  },

  /**
   * ADMIN: Delete user from Firestore and Backend
   */
  async deleteUser(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', cleanEmail));
      
      await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      try {
        localStorage.removeItem(`ipay_cloud_profile_${cleanEmail}`);
        localStorage.removeItem(`ipay_chats_${cleanEmail}`);
        localStorage.removeItem(`ipay_friendships_${cleanEmail}`);
      } catch {}
      return true;
    } catch (err) {
      console.error('Delete user error:', err);
      return false;
    }
  },

  /**
   * ADMIN: Update user followers
   */
  async updateFollowers(email: string, followers: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const docRef = doc(db, 'users', cleanEmail);
      await setDoc(docRef, { followers }, { merge: true });
      
      await fetch('/api/auth/register-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, followers, username: cleanEmail.split('@')[0] }),
      });
      return true;
    } catch (err) {
      console.error('Update followers error:', err);
      return false;
    }
  },

  /**
   * ADMIN: Auto setup user profile with defaults
   */
  async autoSetupProfile(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    const username = cleanEmail.split('@')[0];
    try {
      const defaultProfile = {
        email: cleanEmail,
        username: username,
        fullName: username.charAt(0).toUpperCase() + username.slice(1),
        bio: 'Hello! I am a verified member of the community.',
        location: 'Kaduna, Nigeria',
        isProfileCompleted: true,
        updatedAt: Date.now(),
        followers: '100 Followers',
        postsCount: 5,
        monetization: 'Free Account',
      };

      const docRef = doc(db, 'users', cleanEmail);
      await setDoc(docRef, defaultProfile, { merge: true });
      
      await profileCloudService.saveProfile(cleanEmail, defaultProfile as any);
      
      return true;
    } catch (err) {
      console.error('Auto setup error:', err);
      return false;
    }
  },

  /**
   * Fetch and list ALL authenticated & registered users strictly from the Native App Database (accounts-db.json)
   */
  async getAllDatabaseUsers(): Promise<Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    avatarUrl?: string;
    followers?: string;
    source: string;
  }>> {
    const usersMap = new Map<string, any>();

    // 1. Native App Database Users (Server backend accounts-db.json)
    try {
      const res = await executeWithSafetyTimeout(
        fetch('/api/auth/all-users').then((r) => r.json()),
        2000,
        null
      );
      if (res && Array.isArray(res.users)) {
        res.users.forEach((u: any) => {
          const email = u.email.toLowerCase();
          usersMap.set(email, {
            id: u.id || `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: u.name || u.username,
            username: u.username,
            email: email,
            phoneNumber: u.phoneNumber || '',
            location: u.location || 'Kaduna, Nigeria',
            avatarUrl: u.avatarUrl || '',
            followers: u.followers || 'App Database User',
            source: 'App Native Database',
          });
        });
      }
    } catch (err) {
      console.warn('Fetch native backend users notice:', err);
    }

    const finalUsers = Array.from(usersMap.values());
    console.log(`[APP DATABASE] Total users found in app database: ${finalUsers.length}`);
    return finalUsers;
  },
};
