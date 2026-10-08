import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, RotateCw, Mail, CheckCircle2 } from 'lucide-react';
import { OtpDestination } from '../types';
import { otpService } from '../services/otpService';

interface OtpVerificationScreenProps {
  destination: OtpDestination;
  phoneNumber: string;
  email: string;
  lockEmailOnly?: boolean;
  onVerifySuccess: () => void;
  onBack: () => void;
  onSwitchDestination: (dest: OtpDestination) => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  destination,
  phoneNumber,
  email,
  lockEmailOnly = true,
  onVerifySuccess,
  onBack,
  onSwitchDestination,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  // 5-Minute expiration timer (300 seconds = 5 minutes) as per requirements
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(
    `A 6-digit OTP code was dispatched to ${email || 'isiyakuharuna060@gmail.com'} via Gmail. (Valid for 5 minutes)`
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 5-Minute countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Handle digit change with auto-advance
  const handleDigitChange = (index: number, value: string) => {
    setErrorMessage(null);
    const sanitized = value.replace(/[^0-9]/g, '');

    // If pasted multiple digits
    if (sanitized.length > 1) {
      const newDigits = [...digits];
      const chars = sanitized.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (index + i < 6) newDigits[index + i] = c;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = sanitized;
    setDigits(newDigits);

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    setIsSending(true);
    setDigits(['', '', '', '', '', '']);

    const targetEmail = email.trim() || 'isiyakuharuna060@gmail.com';
    const res = await otpService.sendOtp(targetEmail);
    setIsSending(false);

    setSecondsLeft(300);
    setCanResend(false);

    if (res.success) {
      setNotificationBanner(`A fresh 6-digit OTP code has been dispatched to ${targetEmail} (Valid for 5 minutes).`);
    } else {
      setErrorMessage(res.message || 'Failed to resend OTP. Please try again.');
    }
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = digits.join('');
    if (enteredCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const targetEmail = email.trim() || 'isiyakuharuna060@gmail.com';
    const result = await otpService.verifyOtp(targetEmail, enteredCode);

    setIsSubmitting(false);

    if (result.success) {
      onVerifySuccess();
    } else {
      setErrorMessage(result.error || result.message || 'Invalid or expired 6-digit OTP code.');
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${minutes < 10 ? `0${minutes}` : minutes}:${secs < 10 ? `0${secs}` : secs}`;
  const targetLabel = email || 'isiyakuharuna060@gmail.com';

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 pb-6">
      {/* Top Header matching Sketch */}
      <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between bg-white">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-800 hover:text-slate-600 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[1.75]" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          Verify Email
        </h1>
        <div className="w-5" />
      </div>

      <div className="px-6 pt-6 flex-1 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          {/* Title matching Sketch */}
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
            Verify Email
          </h2>

          {/* Subtitle matching Sketch */}
          <p className="text-xs text-slate-500 text-center mt-3 max-w-[260px] leading-relaxed">
            Enter 6-digit verification code sent to your Gmail inbox
          </p>

          {/* Recipient highlight */}
          <div className="mt-3 text-center">
            <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              {targetLabel}
            </span>
            <div className="mt-1.5 text-[11px] text-slate-500 font-medium">
              (Gmail SMTP OTP Verification • Expires in 5 mins)
            </div>
          </div>

          {/* Notification banner */}
          {notificationBanner && (
            <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-[11px] text-center w-full max-w-[320px] leading-snug font-medium">
              {notificationBanner}
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center w-full max-w-[320px]">
              {errorMessage}
            </div>
          )}

          {/* 6 Dashed/Outlined OTP Boxes matching Sketch */}
          <form onSubmit={handleVerify} className="w-full max-w-[320px] mt-8">
            <div className="flex justify-between items-center gap-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-11 h-12 text-center text-lg font-semibold bg-white border-2 border-dashed rounded-md transition-all focus:outline-none ${
                    digit 
                      ? 'border-emerald-600 bg-emerald-50/20 text-slate-900' 
                      : 'border-slate-300 text-slate-800 focus:border-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Countdown & Resend matching Sketch */}
            <div className="mt-8 flex items-center justify-center text-xs text-slate-600 gap-1.5 select-none">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSending}
                  className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCw className={`w-3 h-3 ${isSending ? 'animate-spin' : ''}`} />
                  Resend code via Gmail
                </button>
              ) : (
                <span>Expires in • <strong className="text-slate-800">{formattedTime}</strong></span>
              )}
            </div>

            {/* Verify Button matching Sketch */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center text-sm disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying OTP...
                  </span>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Back link matching Sketch */}
        <div className="text-center pt-6 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-700 hover:text-slate-900 font-normal inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};
