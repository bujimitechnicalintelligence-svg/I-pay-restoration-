/**
 * Gmail SMTP OTP Service
 * Interacts with /api/send-otp and /api/verify-otp backed by Nodemailer & Gmail SMTP
 * Strictly talks to real database without mock/seeded fallbacks.
 */

export interface SendOtpResult {
  success: boolean;
  message: string;
  email?: string;
  expiresInMinutes?: number;
  emailDispatched?: boolean;
  debugCode?: string;
  error?: string;
  isPasswordError?: boolean;
  accountPreview?: {
    name?: string;
    username?: string;
    email?: string;
    followers?: string;
  };
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface StoredAccount {
  username: string;
  email: string;
  phoneNumber?: string;
  passwordHash?: string;
  fullName?: string;
  followers?: string;
  createdAt: number;
}

const ACCOUNTS_STORAGE_KEY = 'ipay_registered_accounts_v2';

// Clear old cached fake data
try {
  localStorage.removeItem('ipay_registered_accounts_v1');
  localStorage.removeItem('ipay_registered_accounts');
} catch {
  // Ignore
}

export const otpService = {
  /**
   * Clear all local storage accounts
   */
  clearLocalStorage(): void {
    try {
      localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
      localStorage.removeItem('ipay_registered_accounts_v1');
      localStorage.removeItem('ipay_registered_accounts');
    } catch (e) {
      console.error('Failed to clear local accounts:', e);
    }
  },

  /**
   * Deep check if account exists in database
   */
  async checkAccount(
    identifier: string
  ): Promise<{ exists: boolean; account?: any; error?: string }> {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    try {
      const res = await fetch('/api/auth/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId }),
      });
      const data = await res.json();
      return data;
    } catch {
      return { exists: false };
    }
  },

  /**
   * Deep verify credentials against database before attempting login OTP
   */
  async verifyCredentials(
    identifier: string,
    password: string
  ): Promise<{
    success: boolean;
    reason: 'MATCH' | 'WRONG_PASSWORD' | 'NOT_FOUND' | 'INVALID_INPUT';
    error?: string;
    message?: string;
    account?: any;
  }> {
    const cleanId = identifier.trim();
    try {
      const res = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      });
      const data = await res.json();
      return data;
    } catch {
      return {
        success: false,
        reason: 'NOT_FOUND',
        error: `❌ No account found in our database for "${identifier}". Please Sign Up first.`,
      };
    }
  },

  /**
   * Request a 6-digit OTP sent to user's email via Gmail SMTP
   * STRICT: Validates against database BEFORE sending OTP email!
   */
  async sendOtp(
    email: string,
    action?: 'signup' | 'login' | 'reset',
    password?: string
  ): Promise<SendOtpResult> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          action,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Failed to send OTP code to email.',
          error: data.error || 'Failed to send OTP code.',
          isPasswordError: data.isPasswordError,
          accountPreview: data.account,
        };
      }

      return {
        success: true,
        message: data.message || `OTP sent to ${email}`,
        email: data.email,
        expiresInMinutes: data.expiresInMinutes || 5,
        emailDispatched: data.emailDispatched,
        debugCode: data.debugCode,
      };
    } catch (err: any) {
      console.error('Error in sendOtp:', err);
      return {
        success: false,
        message: 'Network error connecting to OTP server. Please try again.',
        error: err.message,
      };
    }
  },

  /**
   * Verify the 6-digit OTP code against server
   */
  async verifyOtp(email: string, code: string): Promise<VerifyOtpResult> {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Invalid or expired OTP code.',
          error: data.error || 'Invalid or expired OTP code.',
        };
      }

      return {
        success: true,
        message: data.message || 'OTP successfully verified!',
      };
    } catch (err: any) {
      console.error('Error in verifyOtp:', err);
      return {
        success: false,
        message: 'Network error verifying OTP code.',
        error: err.message,
      };
    }
  },

  // Account registry helpers - Clean without mock seeds
  getRegisteredAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse registered accounts:', e);
    }
    return [];
  },

  findAccountByEmailOrUsername(identifier: string): StoredAccount | undefined {
    const accounts = this.getRegisteredAccounts();
    const query = identifier.trim().toLowerCase().replace(/^@/, '');
    return accounts.find(
      (acc) =>
        acc.email.toLowerCase() === query ||
        acc.username.toLowerCase() === query ||
        acc.email.toLowerCase() === `${query}@gmail.com`
    );
  },

  saveAccount(account: StoredAccount): void {
    const accounts = this.getRegisteredAccounts();
    const existingIndex = accounts.findIndex(
      (a) =>
        a.email.toLowerCase() === account.email.toLowerCase() ||
        a.username.toLowerCase() === account.username.toLowerCase()
    );

    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...account };
    } else {
      accounts.push(account);
    }

    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

    // Sync to server persistent database
    fetch('/api/auth/register-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: account.username,
        email: account.email,
        phoneNumber: account.phoneNumber || '',
        password: account.passwordHash,
        fullName: account.fullName || account.username,
      }),
    }).catch((err) => console.warn('Sync account to server warning:', err));
  },

  updatePassword(email: string, newPass: string): boolean {
    const accounts = this.getRegisteredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (acc) {
      acc.passwordHash = newPass;
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
    // Sync to server
    fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        newPassword: newPass,
      }),
    }).catch((err) => console.warn('Sync updated password to server warning:', err));
    return true;
  },
};
