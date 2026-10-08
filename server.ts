import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// WILDCARD CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Gmail SMTP Transporter Setup
const GMAIL_USER = (process.env.GMAIL_USER || 'isiyakuharuna060@gmail.com').replace(/[\[\]"]/g, '').trim();
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || 'agnz ueoa xnnc usqf').replace(/[\s"]/g, '').trim();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

// --- PERSISTENT DATABASE MANAGEMENT ---
interface UserAccount {
  username: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  hobby?: string;
  country?: string;
  currentLocation?: string;
  location?: string;
  lifeStatus?: string;
  travel?: string;
  experience?: string;
  school?: string;
  occupation?: string;
  socialHandle?: string;
  publicPhone?: string;
  monetization?: string;
  website?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  watchesCount?: number;
  isProfileCompleted?: boolean;
  isEmailVerified?: boolean;
  followers?: string;
  createdAt: number;
  updatedAt?: number;
}

interface FriendRequestDoc {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'approved';
  timestamp: number;
  approvedAt?: number;
}

const DB_FILE = path.join(__dirname, 'accounts-db.json');
const FRIENDS_DB_FILE = path.join(__dirname, 'friend-requests-db.json');

function loadAccountsFromDisk(): UserAccount[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[DATABASE] Error reading accounts-db.json:', err);
  }

  return [];
}

function saveAccountsToDisk(accounts: UserAccount[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DATABASE] Error writing to accounts-db.json:', err);
  }
}

function loadFriendRequestsFromDisk(): FriendRequestDoc[] {
  try {
    if (fs.existsSync(FRIENDS_DB_FILE)) {
      const data = fs.readFileSync(FRIENDS_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[DATABASE] Error reading friend-requests-db.json:', err);
  }
  return [];
}

function saveFriendRequestsToDisk(requests: FriendRequestDoc[]): void {
  try {
    fs.writeFileSync(FRIENDS_DB_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DATABASE] Error writing to friend-requests-db.json:', err);
  }
}

function findAccountInDB(identifier: string): UserAccount | undefined {
  const accounts = loadAccountsFromDisk();
  const query = identifier.trim().toLowerCase().replace(/^@/, '');
  if (!query) return undefined;

  return accounts.find((acc) => {
    const email = (acc.email || '').toLowerCase();
    const username = (acc.username || '').toLowerCase();
    
    // 1. Exact email match
    if (email === query) return true;
    
    // 2. Exact username match (Only if query is not an email)
    const isEmailQuery = query.includes('@');
    if (!isEmailQuery && username === query) return true;
    
    // 3. Auto-append @gmail.com for username queries
    if (!isEmailQuery && email === `${query}@gmail.com`) return true;
    
    return false;
  });
}

// In-Memory OTP Store: key -> { code, expiresAt, isVerified, email }
const otpStore = new Map<string, { code: string; expiresAt: number; isVerified: boolean; email: string }>();

// Helper function to send OTP email via Gmail SMTP
async function sendOtpEmail(targetEmail: string, otpCode: string): Promise<boolean> {
  const mailOptions = {
    from: `"MyApp Verification" <${GMAIL_USER}>`,
    to: targetEmail,
    subject: `Your MyApp Verification Code: ${otpCode}`,
    text: `Your verification code is: ${otpCode}. It will expire in 5 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0 0 6px 0; font-size: 22px;">MyApp Verification</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Secure One-Time Password (OTP)</p>
        </div>
        <div style="background-color: #f8fafc; border: 1px dashed #95b374; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #2e7d32; font-family: monospace;">${otpCode}</span>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0;">
          Use the 6-digit code above to complete your verification for Sign in, Sign up, or Password Reset.
        </p>
        <p style="color: #ef4444; font-size: 13px; font-weight: bold; margin: 0 0 16px 0;">
          ⏱️ This code will expire in 5 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[GMAIL SMTP] Real OTP email sent to ${targetEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error(`[GMAIL SMTP ERROR] Failed to send email to ${targetEmail}:`, err.message);
    return false;
  }
}

// 1. Endpoint: Deep Account Pre-Check in Database
app.post('/api/auth/check-account', (req, res) => {
  const identifier = (req.body.identifier || req.body.email || '').trim();

  if (!identifier) {
    return res.status(400).json({ success: false, error: 'Identifier (email or username) is required.' });
  }

  const found = findAccountInDB(identifier);

  if (found) {
    return res.json({
      success: true,
      exists: true,
      account: {
        username: found.username,
        email: found.email,
        fullName: found.fullName || found.username,
        followers: found.followers || 'Registered User',
      },
    });
  }

  return res.json({
    success: true,
    exists: false,
    message: 'No account found in database with this email or username.',
  });
});

// 2. Endpoint: Verify Credentials before Login OTP
app.post('/api/auth/verify-credentials', (req, res) => {
  const identifier = (req.body.identifier || req.body.email || '').trim();
  const password = (req.body.password || '').toString();

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      reason: 'INVALID_INPUT',
      error: 'Identifier and password are required.',
    });
  }

  const account = findAccountInDB(identifier);

  if (!account) {
    return res.status(404).json({
      success: false,
      reason: 'NOT_FOUND',
      error: `❌ No account found in our database for "${identifier}". Please click Sign Up to create an account.`,
    });
  }

  if (account.password && account.password !== password) {
    return res.status(400).json({
      success: false,
      reason: 'WRONG_PASSWORD',
      error: '⚠️ Incorrect password entered for this account.',
      account: {
        name: account.fullName || account.username,
        username: `@${account.username}`,
        email: account.email,
        followers: account.followers || 'Registered Account',
      },
    });
  }

  return res.json({
    success: true,
    reason: 'MATCH',
    message: 'Account and password verified in database! Proceeding to OTP.',
    account: {
      username: account.username,
      email: account.email,
      fullName: account.fullName,
    },
  });
});

// 3. Endpoint: /api/send-otp with Deep Database Checks
const handleSendOtp = async (req: express.Request, res: express.Response) => {
  const email = (req.body.email || req.body.target || '').trim().toLowerCase();
  const action = req.body.action as 'signup' | 'login' | 'reset' | undefined;
  const password = req.body.password;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'A valid email address is required to send the OTP code.',
    });
  }

  const existingAccount = findAccountInDB(email);

  // Deep investigation / check against database before sending OTP:
  if (action === 'signup' && existingAccount) {
    console.log(`[DEEP DATABASE CHECK] Sign Up BLOCKED: ${email} already registered.`);
    return res.status(400).json({
      success: false,
      error: `❌ An account with email "${email}" already exists in the database! Sign up is blocked. Please go to Login.`,
      exists: true,
    });
  }

  if (action === 'login') {
    if (!existingAccount) {
      console.log(`[DEEP DATABASE CHECK] Login BLOCKED: ${email} not found in database.`);
      return res.status(404).json({
        success: false,
        error: `❌ Account "${email}" does not exist in our database. Please Sign Up first.`,
        exists: false,
      });
    }

    if (password && existingAccount.password && existingAccount.password !== password) {
      console.log(`[DEEP DATABASE CHECK] Login BLOCKED: Wrong password for ${email}.`);
      return res.status(400).json({
        success: false,
        isPasswordError: true,
        error: '⚠️ Incorrect password entered for this account.',
        account: {
          name: existingAccount.fullName || existingAccount.username,
          username: `@${existingAccount.username}`,
          email: existingAccount.email,
          followers: existingAccount.followers || 'Registered Account',
        },
      });
    }
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(email, {
    code: otpCode,
    expiresAt,
    isVerified: false,
    email,
  });

  console.log(`[OTP GENERATED] 6-digit OTP [${otpCode}] for verified database account: ${email} (Expires in 5 mins)`);

  try {
    const emailSent = await sendOtpEmail(email, otpCode);

    return res.json({
      success: true,
      message: emailSent
        ? `6-digit OTP sent successfully to ${email} via Gmail (Valid for 5 minutes).`
        : `OTP generated for ${email} (Valid for 5 minutes).`,
      email,
      expiresInMinutes: 5,
      emailDispatched: emailSent,
      debugCode: otpCode,
    });
  } catch (err) {
    console.error('[OTP SEND ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'System busy. Please try again later.',
    });
  }
};

app.post('/api/send-otp', handleSendOtp);
app.post('/api/auth/send-otp', handleSendOtp);

// 4. Endpoint: /api/verify-otp
const handleVerifyOtp = (req: express.Request, res: express.Response) => {
  const email = (req.body.email || req.body.target || '').trim().toLowerCase();
  const code = (req.body.code || req.body.otp || '').toString().trim();

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: 'Email and 6-digit OTP code are required.',
    });
  }

  const record = otpStore.get(email);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'No active OTP found for this email. Please request a new OTP code.',
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({
      success: false,
      error: 'OTP code has expired (5-minute limit exceeded). Please request a new one.',
    });
  }

  if (record.code !== code) {
    return res.status(400).json({
      success: false,
      error: 'Invalid 6-digit OTP code. Please check your email and try again.',
    });
  }

  // Mark verified
  record.isVerified = true;
  otpStore.set(email, record);

  console.log(`[OTP VERIFIED] Successfully verified OTP for ${email}`);

  return res.json({
    success: true,
    message: `OTP successfully verified for ${email}!`,
    email,
  });
};

app.post('/api/verify-otp', handleVerifyOtp);
app.post('/api/auth/verify-otp', handleVerifyOtp);

// 5. Endpoint: Register Account into Database
app.post('/api/auth/register-account', (req, res) => {
  const { username, email, phoneNumber, password, fullName } = req.body;
  if (!email || !username) {
    return res.status(400).json({ success: false, error: 'Username and email are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const accounts = loadAccountsFromDisk();

  const existingIdx = accounts.findIndex(
    (a) => a.email.toLowerCase() === cleanEmail || a.username.toLowerCase() === username.toLowerCase().trim()
  );

  const newAcc: UserAccount = {
    username: username.trim(),
    email: cleanEmail,
    phoneNumber: phoneNumber || '',
    password: password || '',
    fullName: fullName || username.trim(),
    followers: '1 Follower',
    createdAt: Date.now(),
  };

  if (existingIdx >= 0) {
    accounts[existingIdx] = {
      ...accounts[existingIdx],
      ...newAcc,
      password: password ? password : (accounts[existingIdx].password || ''),
    };
  } else {
    accounts.push(newAcc);
  }

  saveAccountsToDisk(accounts);
  console.log(`[DATABASE] Registered/Updated account ${cleanEmail} in accounts-db.json`);

  return res.json({ success: true, message: 'Account registered into database successfully.', account: newAcc });
});

// 5b. Endpoint: Delete User (Admin)
app.post('/api/auth/delete-user', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  
  const accounts = loadAccountsFromDisk();
  const filtered = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase().trim());
  
  if (accounts.length === filtered.length) {
    return res.status(404).json({ success: false, error: 'User not found in backend' });
  }
  
  saveAccountsToDisk(filtered);
  return res.json({ success: true, message: 'User deleted from backend database.' });
});

// 5c. Endpoint: Wipe All Users & Profiles
app.post('/api/auth/wipe-all', (req, res) => {
  saveAccountsToDisk([]);
  saveFriendRequestsToDisk([]);
  console.log('[DATABASE] Wiped all accounts and friend requests from disk.');
  return res.json({ success: true, message: 'All backend accounts, profiles, and friend requests have been wiped.' });
});

app.post('/api/profile/wipe-all', (req, res) => {
  saveAccountsToDisk([]);
  console.log('[DATABASE] Wiped all profiles from disk.');
  return res.json({ success: true, message: 'All profiles wiped from disk.' });
});

// 6. Endpoint: Update Password
app.post('/api/auth/update-password', (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, error: 'Email and new password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const accounts = loadAccountsFromDisk();
  const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (acc) {
    acc.password = newPassword;
    saveAccountsToDisk(accounts);
    return res.json({ success: true, message: 'Password updated successfully in database.' });
  }

  // Create if missing
  accounts.push({
    email: cleanEmail,
    username: cleanEmail.split('@')[0],
    phoneNumber: '+234 800 000 0000',
    password: newPassword,
    fullName: cleanEmail.split('@')[0],
    followers: '1 Follower',
    createdAt: Date.now(),
  });
  saveAccountsToDisk(accounts);
  return res.json({ success: true, message: 'Account password created in database.' });
});

// 7. Endpoint: Get all database users for Chat & Add Friends
app.get('/api/auth/all-users', (req, res) => {
  const accounts = loadAccountsFromDisk();
  return res.json({
    success: true,
    total: accounts.length,
    users: accounts.map((acc) => ({
      id: `usr_${acc.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: acc.fullName || acc.username,
      username: acc.username,
      email: acc.email,
      phoneNumber: acc.phoneNumber || '+234 803 123 4567',
      location: acc.location || 'Kaduna, Nigeria',
      avatarUrl: acc.avatarUrl || '',
      bio: acc.bio || '',
      followers: acc.followers || 'Registered User',
      source: 'Database Auth',
      createdAt: acc.createdAt,
    })),
  });
});

// 8. Endpoint: Save Full Profile & Avatar in App Database
app.post('/api/profile/save', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const profileData = req.body.profile || req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required to save profile.' });
  }

  const accounts = loadAccountsFromDisk();
  let accIndex = accounts.findIndex((a) => a.email.toLowerCase() === email);

  if (accIndex === -1) {
    // Create new account if not present
    const newAcc: UserAccount = {
      email,
      username: profileData.username || email.split('@')[0],
      fullName: profileData.fullName || email.split('@')[0],
      createdAt: Date.now(),
      ...profileData,
      isProfileCompleted: true,
      updatedAt: Date.now(),
    };
    accounts.push(newAcc);
    accIndex = accounts.length - 1;
  } else {
    accounts[accIndex] = {
      ...accounts[accIndex],
      ...profileData,
      email, // Keep email consistent
      isProfileCompleted: true,
      updatedAt: Date.now(),
    };
  }

  saveAccountsToDisk(accounts);
  console.log(`[APP DATABASE] Saved profile and avatar for ${email}`);

  return res.json({
    success: true,
    message: 'Profile saved successfully in app database.',
    profile: accounts[accIndex],
  });
});

// 9. Endpoint: Get Profile from App Database
app.get('/api/profile/get', (req, res) => {
  const email = (req.query.email as string || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email parameter is required.' });
  }

  const accounts = loadAccountsFromDisk();
  const acc = accounts.find((a) => a.email.toLowerCase() === email);

  if (!acc) {
    return res.status(404).json({ success: false, message: 'Profile not found.' });
  }

  return res.json({ success: true, profile: acc });
});

// 10. Endpoint: Get All Profiles
app.get('/api/profile/all', (req, res) => {
  const accounts = loadAccountsFromDisk();
  return res.json({
    success: true,
    profiles: accounts.filter((a) => a.isProfileCompleted || a.email),
  });
});

// 11. Endpoint: Send Friend Request (Saved in App Database)
app.post('/api/friends/send-request', (req, res) => {
  const from = (req.body.from || '').trim().toLowerCase();
  const to = (req.body.to || '').trim().toLowerCase();

  if (!from || !to || from === to) {
    return res.status(400).json({ success: false, error: 'Valid from and to emails required.' });
  }

  const reqId = [from, to].sort().join('_');
  const requests = loadFriendRequestsFromDisk();
  const existing = requests.find((r) => r.id === reqId);

  if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
    return res.json({ success: true, message: 'Friend request already exists.', request: existing });
  }

  const newReq: FriendRequestDoc = {
    id: reqId,
    from,
    to,
    status: 'pending',
    timestamp: Date.now(),
  };

  const filtered = requests.filter((r) => r.id !== reqId);
  filtered.push(newReq);
  saveFriendRequestsToDisk(filtered);

  console.log(`[APP DATABASE] Friend request created: ${from} -> ${to}`);
  return res.json({ success: true, message: 'Friend request sent.', request: newReq });
});

// 12. Endpoint: Approve Friend Request (Saved in App Database)
app.post('/api/friends/approve-request', (req, res) => {
  const from = (req.body.from || '').trim().toLowerCase();
  const to = (req.body.to || '').trim().toLowerCase();

  if (!from || !to) {
    return res.status(400).json({ success: false, error: 'Valid from and to emails required.' });
  }

  const reqId = [from, to].sort().join('_');
  const requests = loadFriendRequestsFromDisk();
  const target = requests.find((r) => r.id === reqId);

  if (!target) {
    // Create and approve
    const newReq: FriendRequestDoc = {
      id: reqId,
      from,
      to,
      status: 'approved',
      timestamp: Date.now(),
      approvedAt: Date.now(),
    };
    requests.push(newReq);
  } else {
    target.status = 'approved';
    target.approvedAt = Date.now();
  }

  saveFriendRequestsToDisk(requests);
  console.log(`[APP DATABASE] Friend request approved: ${from} <-> ${to}`);
  return res.json({ success: true, message: 'Friend request approved.' });
});

// 13. Endpoint: Get all my friendships from App Database
app.get('/api/friends/all', (req, res) => {
  const email = (req.query.email as string || '').trim().toLowerCase();
  if (!email) {
    return res.json({ success: true, friendships: [] });
  }

  const requests = loadFriendRequestsFromDisk();
  const myFriendships = requests.filter(
    (r) => r.from.toLowerCase() === email || r.to.toLowerCase() === email
  );

  return res.json({ success: true, friendships: myFriendships });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const accounts = loadAccountsFromDisk();
  res.json({
    status: 'ok',
    gmailUser: GMAIL_USER,
    service: 'Gmail SMTP OTP Service with Persistent JSON Database',
    expiryDuration: '5 minutes',
    sender: 'MyApp Verification',
    totalRegisteredAccounts: accounts.length,
    accountsList: accounts.map((a) => ({ email: a.email, username: a.username })),
  });
});

// Vite Dev Server Integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await vite.transformIndexHtml(
        url,
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>I-pay online</title>
    <meta name="description" content="I-pay online secure authentication, mobile onboarding, OTP verification, and account setup dashboard." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Running on http://0.0.0.0:${PORT} with Persistent Database & Gmail SMTP OTP verification.`);
});
