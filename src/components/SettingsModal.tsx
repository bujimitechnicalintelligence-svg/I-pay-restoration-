import React, { useState } from 'react';
import { X, Lock, LogOut, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { otpService } from '../services/otpService';

interface SettingsModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onLogout: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  user,
  onClose,
  onLogout,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'change-password'>('main');

  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!existingPassword) {
      setError('Please enter your existing password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('❌ New password and confirmation do not match! Rejected.');
      return;
    }

    setIsProcessing(true);

    // Verify existing password against database
    const verifyRes = await firebaseAuthService.verifyCredentials(user.email, existingPassword);
    
    if (!verifyRes.success && verifyRes.reason === 'WRONG_PASSWORD') {
      setIsProcessing(false);
      setError('❌ Existing password entered is incorrect! Rejected.');
      return;
    }

    // Update password in local and server database
    otpService.updatePassword(user.email, newPassword);
    
    setIsProcessing(false);
    onShowToast('Password successfully updated!');
    setExistingPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setActiveTab('main');
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
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Account Settings</h3>
              <p className="text-[11px] text-slate-500">{user.email}</p>
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
          <div className="mt-3 p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-200 text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'main' ? (
          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setActiveTab('change-password');
              }}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Change Password</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full p-3.5 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200 flex items-center justify-between text-xs font-bold text-red-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Log Out</span>
              </div>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePasswordSubmit} className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">Change Account Password</h4>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveTab('main');
                }}
                className="text-xs text-emerald-700 font-semibold underline"
              >
                Back
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Existing Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-[#2e7d32] text-white rounded-xl text-xs font-bold hover:bg-[#256829] transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying & Updating...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
