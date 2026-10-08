import React, { useState } from 'react';
import { Eye, EyeOff, Mail, AlertCircle, ArrowRight, ShieldAlert, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { GoogleLogo, AppleLogo, IPayLogoPlaceholder } from './SocialIcons';
import { OtpDestination } from '../types';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { otpService } from '../services/otpService';

interface SignUpScreenProps {
  onNext: (data: {
    username: string;
    email: string;
    phoneNumber: string;
    destination: OtpDestination;
  }) => void;
  onNavigateLogin: () => void;
  onSocialAuth: (provider: 'google' | 'apple') => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onNext,
  onNavigateLogin,
  onSocialAuth,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ready to Proceed with OTP state
  const [readySignUpData, setReadySignUpData] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // Existing account alert state (Strictly blocks duplicate Sign Up)
  const [existingAccountFound, setExistingAccountFound] = useState<{
    email: string;
    source?: string;
  } | null>(null);

  // 1. Deep Database Inquiry & Verification Step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExistingAccountFound(null);
    setReadySignUpData(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('Please accept both Terms and Privacy policy');
      return;
    }

    setIsVerifying(true);

    // Deep database inquiry across Firebase Auth, Firestore, and persistent backend database
    const checkEmail = await firebaseAuthService.checkAccountExists(cleanEmail);
    setIsVerifying(false);

    if (checkEmail.exists) {
      const foundEmail = checkEmail.email || cleanEmail;
      setExistingAccountFound({
        email: foundEmail,
        source: checkEmail.source,
      });
      setError(`⚠️ ACCOUNT DETECTED: This email "${foundEmail}" is already in our Firebase Authentication database. Duplicate registration is blocked. Please Sign In.`);
      return;
    }

    if (checkEmail.error) {
      setError(`⚠️ ${checkEmail.error}`);
      return;
    }

    // Verified new account! Prompt explicit "Proceed with OTP" button
    setReadySignUpData({
      email: cleanEmail,
      password,
    });
  };

  // 2. Explicit "Proceed with OTP" click
  const handleProceedWithOtp = async () => {
    if (!readySignUpData) return;
    setIsSendingOtp(true);
    setError(null);

    const otpRes = await otpService.sendOtp(readySignUpData.email, 'signup');
    setIsSendingOtp(false);

    if (otpRes.success) {
      // Register into Firebase (Firestore saves ONLY email and password)
      await firebaseAuthService.registerAccount({
        username: readySignUpData.email.split('@')[0],
        email: readySignUpData.email,
        phoneNumber: '',
        password: readySignUpData.password,
      });

      otpService.saveAccount({
        username: readySignUpData.email.split('@')[0],
        email: readySignUpData.email,
        phoneNumber: '',
        passwordHash: readySignUpData.password,
        createdAt: Date.now(),
      });

      // Proceed to OTP verification screen (NEVER SKIPPED)
      onNext({
        username: readySignUpData.email.split('@')[0],
        email: readySignUpData.email,
        phoneNumber: '',
        destination: 'email',
      });
    } else {
      if (otpRes.error?.includes('already') || otpRes.message?.includes('already')) {
        setExistingAccountFound({
          email: readySignUpData.email,
        });
        setReadySignUpData(null);
      }
      setError(otpRes.error || otpRes.message || 'Failed to dispatch verification OTP.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 justify-between">
      {/* Top Header */}
      <div className="border-b border-slate-200 px-4 py-2.5 flex items-center justify-center bg-white shrink-0">
        <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight text-center">
          Create Account
        </h1>
      </div>

      <div className="px-5 py-3 flex-1 flex flex-col justify-between max-w-sm mx-auto w-full">
        {/* Logo Placeholder Box matching Sketch */}
        <div className="my-2 flex justify-center">
          <IPayLogoPlaceholder />
        </div>

        {/* Verifying in Progress Status Indicator */}
        {isVerifying && (
          <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium text-center flex items-center justify-center gap-2 animate-in fade-in">
            <span className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span>Verifying in progress...</span>
          </div>
        )}

        {/* Existing Account Found Banner with Direct Login Redirect (Hard Blocking View) */}
        {existingAccountFound && (
          <div className="my-3 p-4 bg-amber-50/95 border-2 border-amber-400 rounded-2xl text-xs space-y-3 animate-in zoom-in-95 duration-200 shadow-md">
            <div className="flex items-start gap-2.5 text-amber-950">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-amber-900">Account Already Exists!</h4>
                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                  The account for <strong className="text-amber-950 font-bold">{existingAccountFound.email}</strong> is already registered in the database.
                </p>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  🚫 Duplicate account registration is strictly blocked. Please sign in to access your existing account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateLogin}
              className="w-full py-3 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
            >
              <span>Go to Login / Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setExistingAccountFound(null);
                setError(null);
                setEmail('');
              }}
              className="w-full text-center text-[11px] text-amber-800 hover:text-amber-950 underline font-semibold flex items-center justify-center gap-1 pt-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Use a different email address</span>
            </button>
          </div>
        )}

        {/* Account Ready Confirmation Card with Required "Proceed with OTP" button */}
        {readySignUpData && (
          <div className="mb-3 p-4 bg-emerald-50/90 border-2 border-emerald-500/80 rounded-2xl text-xs space-y-3 animate-in zoom-in-95 duration-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">{readySignUpData.email}</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold truncate">Ready for registration</p>
              </div>
            </div>

            <div className="p-2 bg-white rounded-xl border border-emerald-200 text-slate-700 text-[11px] text-center font-medium leading-relaxed">
              ✅ This email is not in our database. You can proceed to create a new account by verifying your Gmail.
            </div>

            <button
              type="button"
              onClick={handleProceedWithOtp}
              disabled={isSendingOtp}
              className="w-full py-3 bg-[#95B374] hover:bg-[#86a564] active:bg-[#789657] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-75"
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

        {/* Generic Error notification */}
        {error && !existingAccountFound && !readySignUpData && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600 text-center font-medium leading-tight">
            {error}
          </div>
        )}

        {/* Sign Up Form - Clean: Email, Password, Confirm Password (Hidden when Existing Account is detected or Ready for OTP) */}
        {!existingAccountFound && !readySignUpData && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setExistingAccountFound(null);
                    setError(null);
                  }}
                  placeholder="example@mail.com"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors"
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
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>
            </div>

            {/* Checkboxes matching Sketch */}
            <div className="space-y-1.5 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="cursor-pointer select-none text-[11px]">
                  Terms <span onClick={(e) => { e.preventDefault(); onOpenTerms(); }} className="text-emerald-700 underline text-[10px] ml-0.5">View</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="privacy"
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="privacy" className="cursor-pointer select-none text-[11px]">
                  Privacy <span onClick={(e) => { e.preventDefault(); onOpenPrivacy(); }} className="text-emerald-700 underline text-[10px] ml-0.5">View</span>
                </label>
              </div>
            </div>

            {/* Submit Button matching Sketch (Muted Green Button) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full h-11 bg-[#95B374] hover:bg-[#86a564] active:bg-[#789657] text-white font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center text-xs sm:text-sm disabled:opacity-75"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying in progress...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Divider: Or sign up with */}
        {!existingAccountFound && !readySignUpData && (
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2.5 text-slate-500">
                Or sign up with
              </span>
            </div>
          </div>
        )}

        {/* Social Round Buttons matching Sketch */}
        {!existingAccountFound && !readySignUpData && (
          <div className="flex justify-center items-center gap-8">
            {/* Google Button */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onSocialAuth('google')}
                className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-xs hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all"
                aria-label="Sign up with Google"
              >
                <GoogleLogo className="w-5 h-5" />
              </button>
              <span className="text-[11px] text-slate-700 mt-0.5 font-normal">Google</span>
            </div>

            {/* Apple Button */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onSocialAuth('apple')}
                className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center shadow-xs hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-900"
                aria-label="Sign up with Apple"
              >
                <AppleLogo className="w-5 h-5" />
              </button>
              <span className="text-[11px] text-slate-700 mt-0.5 font-normal">Apple</span>
            </div>
          </div>
        )}

        {/* Bottom Link: Already have account? Login */}
        <div className="text-center pt-3 pb-1 text-xs text-slate-600">
          Already have account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-emerald-700 font-medium hover:underline focus:outline-none"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
