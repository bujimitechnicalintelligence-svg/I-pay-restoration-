import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, ArrowRight, UserCheck, KeyRound, Mail, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { GoogleLogo, AppleLogo, IPayLogoPlaceholder } from './SocialIcons';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { otpService } from '../services/otpService';

interface LoginScreenProps {
  onLoginSuccess: (emailOrUsername: string) => void;
  onAdminLogin: () => void;
  onNavigateSignUp: () => void;
  onNavigateForgotPassword: () => void;
  onSocialAuth: (provider: 'google' | 'apple') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onAdminLogin,
  onNavigateSignUp,
  onNavigateForgotPassword,
  onSocialAuth,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remembered last login state
  const [lastRememberedEmail, setLastRememberedEmail] = useState<string | null>(null);

  // Ready to proceed with OTP state
  const [readyAccount, setReadyAccount] = useState<{
    email: string;
    username: string;
    name: string;
    followers: string;
  } | null>(null);

  // Incorrect Password Account Preview State
  const [incorrectAccount, setIncorrectAccount] = useState<{
    name: string;
    username: string;
    email: string;
    followers: string;
  } | null>(null);

  // Load remembered last login on mount only if account exists in database
  useEffect(() => {
    try {
      const remembered = localStorage.getItem('ipay_remembered_email');
      if (remembered) {
        otpService.checkAccount(remembered).then((res) => {
          if (res.exists) {
            setLastRememberedEmail(remembered);
            setIdentifier(remembered);
          } else {
            // Account does not exist in app database - wipe out
            localStorage.removeItem('ipay_remembered_email');
            localStorage.removeItem('ipay_remember_me_active');
            setLastRememberedEmail(null);
            setIdentifier('');
          }
        }).catch(() => {
          localStorage.removeItem('ipay_remembered_email');
          localStorage.removeItem('ipay_remember_me_active');
        });
      }
    } catch {
      // Ignore
    }
  }, []);

  // 1. Instant Check Step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIncorrectAccount(null);
    setReadyAccount(null);

    const emailOrUsername = identifier.trim();
    if (!emailOrUsername) {
      setError('Please enter your username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    // SPECIAL ADMIN CHECK
    if (emailOrUsername === '@bujimicentral' && password === 'Abdussalam@100') {
      onAdminLogin();
      return;
    }

    setIsVerifying(true);

    // Instant verification against database
    const verifyResult = await firebaseAuthService.verifyCredentials(emailOrUsername, password);
    setIsVerifying(false);

    if (!verifyResult.success) {
      if (verifyResult.reason === 'NOT_FOUND') {
        setError(`❌ Account "${emailOrUsername}" does not exist in our database. Please click Sign Up.`);
        return;
      }

      if (verifyResult.reason === 'WRONG_PASSWORD') {
        const acc = verifyResult.account || {};
        setIncorrectAccount({
          name: acc.name || emailOrUsername.split('@')[0],
          username: acc.username || `@${emailOrUsername.split('@')[0]}`,
          email: acc.email || emailOrUsername,
          followers: acc.followers || 'Registered User',
        });
        setError('⚠️ Incorrect password entered for this account.');
        return;
      }

      setError(verifyResult.error || 'Authentication check failed.');
      return;
    }

    // Verified! Prompt explicit "Proceed with OTP" button
    const targetEmail = verifyResult.account?.email || (emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@gmail.com`);
    
    // Persist remembered login state
    if (rememberMe) {
      try {
        localStorage.setItem('ipay_remembered_email', targetEmail);
        localStorage.setItem('ipay_remember_me_active', 'true');
      } catch {
        // Ignore
      }
    }

    setReadyAccount({
      email: targetEmail,
      username: verifyResult.account?.username || `@${emailOrUsername.split('@')[0]}`,
      name: verifyResult.account?.name || emailOrUsername.split('@')[0],
      followers: verifyResult.account?.followers || 'Registered User',
    });
  };

  // 2. Explicit "Proceed with OTP" click
  const handleProceedWithOtp = async () => {
    if (!readyAccount) return;
    setIsSendingOtp(true);
    setError(null);

    const otpRes = await otpService.sendOtp(readyAccount.email, 'login', password);
    setIsSendingOtp(false);

    if (otpRes.success) {
      if (rememberMe) {
        try {
          localStorage.setItem('ipay_remembered_email', readyAccount.email);
          localStorage.setItem('ipay_remember_me_active', 'true');
        } catch {
          // Ignore
        }
      }
      onLoginSuccess(readyAccount.email);
    } else {
      setError(otpRes.error || otpRes.message || 'Failed to dispatch verification OTP code.');
    }
  };

  const handleClearRemembered = () => {
    try {
      localStorage.removeItem('ipay_remembered_email');
      localStorage.removeItem('ipay_remember_me_active');
      setLastRememberedEmail(null);
      setIdentifier('');
      setPassword('');
      setError(null);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 pb-6">
      {/* Top Header */}
      <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between bg-white">
        <button
          type="button"
          onClick={onNavigateSignUp}
          className="p-1 -ml-1 text-slate-800 hover:text-slate-600 transition-colors"
          aria-label="Back to sign up"
        >
          <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          Login
        </h1>
        <div className="w-5" />
      </div>

      <div className="px-6 pt-4 flex-1 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          {/* Dashed I-PAY LOGO placeholder matching Sketch */}
          <div className="my-3">
            <IPayLogoPlaceholder />
          </div>

          {/* Last Remembered Login Badge */}
          {lastRememberedEmail && !readyAccount && !incorrectAccount && (
            <div className="w-full mb-3 p-2.5 bg-slate-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-full bg-[#2e7d32] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {lastRememberedEmail.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <span className="text-[10px] text-slate-500 block leading-tight font-medium">Remembered Last Login:</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">{lastRememberedEmail}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearRemembered}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium shrink-0 ml-2"
              >
                Switch
              </button>
            </div>
          )}

          {/* Verifying in Progress Status Indicator */}
          {isVerifying && (
            <div className="w-full mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium text-center flex items-center justify-center gap-2 animate-in fade-in">
              <span className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              <span>Verifying in progress...</span>
            </div>
          )}

          {/* Account Verified Confirmation Card with Required "Proceed with OTP" button */}
          {readyAccount && (
            <div className="w-full mb-4 p-4 bg-emerald-50/90 border-2 border-emerald-500/80 rounded-2xl text-xs space-y-3 animate-in zoom-in-95 duration-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {readyAccount.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate">{readyAccount.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{readyAccount.username} • <span className="text-emerald-700 font-bold">{readyAccount.followers}</span></p>
                  <p className="text-[10px] text-slate-500 truncate font-semibold">{readyAccount.email}</p>
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-emerald-200 text-slate-700 text-[11px] text-center font-medium leading-relaxed">
                ✅ Account verified! Click below to receive your 6-digit OTP code to verify and access your account.
              </div>

              <button
                type="button"
                onClick={handleProceedWithOtp}
                disabled={isSendingOtp}
                className="w-full py-3 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-75"
              >
                {isSendingOtp ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending 6-Digit OTP...
                  </span>
                ) : (
                  <>
                    <span>Proceed with OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error notification */}
          {error && !incorrectAccount && !readyAccount && (
            <div className="w-full mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          {/* Account Profile Preview Card on Incorrect Password */}
          {incorrectAccount && (
            <div className="w-full mb-4 p-3.5 bg-slate-50 border border-amber-300 rounded-2xl text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {incorrectAccount.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">{incorrectAccount.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{incorrectAccount.username} • <span className="text-emerald-700 font-bold">{incorrectAccount.followers}</span></p>
                  <p className="text-[10px] text-slate-400 truncate">{incorrectAccount.email}</p>
                </div>
              </div>

              <div className="p-2 bg-red-50 text-red-700 font-semibold text-[11px] rounded-xl border border-red-200 text-center flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Incorrect password for this account!</span>
              </div>

              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="w-full py-2.5 bg-[#2e7d32] hover:bg-[#256829] text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Reset Password with 5-Minute OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form matching Sketch */}
          {!readyAccount && (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Username or Email */}
              <div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIncorrectAccount(null);
                    setError(null);
                  }}
                  placeholder="Username or Email"
                  className="w-full h-11 px-3 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors text-slate-800 placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              {/* Password with Eye toggle */}
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIncorrectAccount(null);
                    setError(null);
                  }}
                  placeholder="Password"
                  className="w-full h-11 px-3 pr-10 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors text-slate-800 placeholder:text-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>

              {/* Remember me & Forgot password row matching Sketch */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-slate-700 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-emerald-700 hover:underline font-medium text-xs focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button matching Sketch */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full h-11 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center text-sm disabled:opacity-75"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying in progress...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider: Or sign in with */}
          {!readyAccount && (
            <div className="w-full relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-500">
                  Or sign in with
                </span>
              </div>
            </div>
          )}

          {/* Social Round Buttons matching Sketch */}
          {!readyAccount && (
            <div className="flex justify-center items-center gap-6">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => onSocialAuth('google')}
                className="w-12 h-12 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-xs hover:bg-slate-50 hover:border-slate-400 hover:scale-105 active:scale-95 transition-all"
                aria-label="Sign in with Google"
              >
                <GoogleLogo className="w-6 h-6" />
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => onSocialAuth('apple')}
                className="w-12 h-12 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-xs hover:bg-slate-50 hover:border-slate-400 hover:scale-105 active:scale-95 transition-all text-slate-900"
                aria-label="Sign in with Apple"
              >
                <AppleLogo className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Link matching Sketch */}
        <div className="text-center pt-6 pb-2 text-xs text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateSignUp}
            className="text-emerald-700 font-medium hover:underline focus:outline-none"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
