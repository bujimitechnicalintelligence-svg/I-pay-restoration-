import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { otpService } from '../services/otpService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onResetComplete,
}) => {
  const [step, setStep] = useState<'request' | 'verify' | 'new-password' | 'sent'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered email address');
      return;
    }
    setError(null);
    setIsProcessing(true);

    const res = await otpService.sendOtp(cleanEmail);
    setIsProcessing(false);

    if (res.success) {
      setSuccessMessage(`A 6-digit OTP code has been dispatched to ${cleanEmail} via Gmail. (Expires in 5 minutes)`);
      setStep('verify');
    } else {
      setError(res.message || 'Failed to dispatch password reset OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit security OTP code');
      return;
    }
    setError(null);
    setIsProcessing(true);

    const result = await otpService.verifyOtp(email.trim(), otp.trim());
    setIsProcessing(false);

    if (result.success) {
      setStep('new-password');
    } else {
      setError(result.error || result.message || 'Invalid or expired OTP code.');
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    setIsProcessing(true);

    otpService.updatePassword(email.trim(), newPassword);

    setTimeout(() => {
      setIsProcessing(false);
      onResetComplete(email.trim());
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Password Recovery</h3>
              <p className="text-[11px] text-slate-500">Gmail SMTP 5-Minute OTP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-200 text-center">
            {error}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="mt-4 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered email address below. A 6-digit OTP code will be sent to your Gmail inbox (Valid for 5 minutes).
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full h-11 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-[#2e7d32] text-white rounded-xl text-xs font-bold hover:bg-[#256829] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Gmail OTP...
                </span>
              ) : (
                'Send 5-Minute OTP Code'
              )}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs space-y-1">
              <p className="font-bold text-xs">6-Digit Code Sent via Gmail</p>
              <p className="text-[11px] leading-relaxed">
                A 6-digit OTP code was sent to <span className="font-bold">{email}</span>. Please check your email inbox or spam folder. (Expires in 5 minutes)
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full h-11 px-3 text-center tracking-widest text-lg font-bold border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-[#2e7d32] text-white rounded-xl text-xs font-bold hover:bg-[#256829] transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isProcessing ? 'Verifying OTP...' : 'Verify 6-Digit Code'}
            </button>
          </form>
        )}

        {step === 'new-password' && (
          <form onSubmit={handleSavePassword} className="mt-4 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              OTP Verified! Enter your new password below:
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isProcessing ? 'Saving...' : 'Save New Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
