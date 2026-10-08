import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { IPayLogoPlaceholder } from './SocialIcons';

interface SetPasswordScreenProps {
  verifiedEmail: string;
  verifiedName: string;
  provider: 'google' | 'apple';
  onPasswordSet: (password: string) => void;
  onBack: () => void;
}

export const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  verifiedEmail,
  verifiedName,
  provider,
  onPasswordSet,
  onBack,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Too short', 'Weak', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onPasswordSet(password);
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 pb-6">
      {/* Top Header */}
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
          Set Password
        </h1>
        <div className="w-5" />
      </div>

      <div className="px-6 pt-4 flex-1 flex flex-col justify-between">
        <div className="w-full flex flex-col items-center">
          <div className="my-3">
            <IPayLogoPlaceholder />
          </div>

          {/* Verified Badge */}
          <div className="w-full p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5 truncate">
                <span>{provider === 'google' ? 'Google' : 'Apple'} Verified</span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-medium px-1.5 py-0.2 rounded">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 truncate">
                {verifiedEmail} ({verifiedName})
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mb-4 max-w-[280px]">
            Create a secure password to protect your I-pay online wallet and sign in anytime.
          </p>

          {error && (
            <div className="w-full mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full h-11 px-3 pr-10 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-colors ${
                          strength >= step ? strengthColors[strength] : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Strength: {strengthLabels[strength]}</span>
                    <span>Use uppercase, numbers & symbols</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full h-11 px-3 pr-10 text-xs bg-white border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none transition-colors text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-11 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center text-sm"
              >
                Continue to Account Profile Setup
              </button>
            </div>
          </form>
        </div>

        <div className="text-center pt-6 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
