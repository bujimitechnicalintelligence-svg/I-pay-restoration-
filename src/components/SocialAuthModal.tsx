import React, { useState } from 'react';
import { X, CheckCircle2, Shield, User, Loader2 } from 'lucide-react';
import { GoogleLogo, AppleLogo } from './SocialIcons';

interface SocialAuthModalProps {
  provider: 'google' | 'apple' | null;
  onClose: () => void;
  onSuccess: (data: { email: string; name: string; username: string }) => void;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({ provider, onClose, onSuccess }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<'system' | 'custom'>('system');

  if (!provider) return null;

  const isGoogle = provider === 'google';
  const systemEmail = "isiyakuharuna060@gmail.com";
  const systemName = "Isiyaku Haruna";
  const systemUsername = "isiyaku_h";

  const handleConfirm = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess({
        email: systemEmail,
        name: systemName,
        username: systemUsername,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-xs">
              {isGoogle ? <GoogleLogo className="w-4 h-4" /> : <AppleLogo className="w-4 h-4 text-slate-900" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {isGoogle ? 'Sign in with Google' : 'Sign in with Apple'}
              </h3>
              <p className="text-[11px] text-slate-500">I-pay online Identity Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-xs text-slate-600">
              {isGoogle ? (
                <span>Choose your system Google Account to authenticate with <strong>I-pay online</strong>:</span>
              ) : (
                <span>Confirm your Apple ID authorization to link securely with <strong>I-pay online</strong>:</span>
              )}
            </p>
          </div>

          {/* Account Card Selection */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedAccount('system')}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                selectedAccount === 'system'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {systemName.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-900 truncate">{systemName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{systemEmail}</div>
                </div>
              </div>
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${selectedAccount === 'system' ? 'text-emerald-600' : 'text-slate-300'}`} />
            </button>

            <button
              type="button"
              onClick={() => setSelectedAccount('custom')}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                selectedAccount === 'custom'
                  ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-700">Use another system account</div>
                  <div className="text-[10px] text-slate-400">Switch workspace or personal account</div>
                </div>
              </div>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-normal">
              After verification, you will set a secure password for your I-pay online profile dashboard.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isVerifying}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying with {isGoogle ? 'Google' : 'Apple'}...</span>
              </>
            ) : (
              <span>Continue as {systemName.split(' ')[0]}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
