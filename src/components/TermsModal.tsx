import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface TermsModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ type, onClose, onAccept }) => {
  if (!type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              {isTerms ? <FileText className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <p className="text-xs text-slate-500">I-pay online Legal Agreement</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto text-xs sm:text-sm text-slate-600 space-y-3.5 leading-relaxed">
          {isTerms ? (
            <>
              <p className="font-medium text-slate-800">
                Welcome to I-pay online. By signing up or using the application, you agree to comply with our financial platform conditions:
              </p>
              <div className="space-y-2">
                <p><strong>1. Account Security:</strong> You are responsible for safeguarding your username, password, OTP, and transaction PIN. Never share verification codes.</p>
                <p><strong>2. Transaction Limits:</strong> Unverified accounts start at Tier 1 limits. Tier 2 verification unlocks enhanced daily transaction and withdrawal limits.</p>
                <p><strong>3. Compliance & Anti-Fraud:</strong> I-pay online complies with financial regulations, anti-money laundering (AML), and identity standards.</p>
                <p><strong>4. Virtual Card Usage:</strong> The issued virtual card is governed by card network rules and subject to wallet balance availability.</p>
              </div>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-800">
                Your privacy is paramount at I-pay online. Here is how we protect and process your data:
              </p>
              <div className="space-y-2">
                <p><strong>1. Data Encryption:</strong> All credentials, passwords, and banking communications are secured using end-to-end industry-grade encryption.</p>
                <p><strong>2. Information We Collect:</strong> Necessary information to provide secure payment transfers, phone verification, and identity compliance.</p>
                <p><strong>3. Third-Party Integrations:</strong> Google and Apple sign-in authenticate your device identity without sharing your external passwords.</p>
                <p><strong>4. Your Rights:</strong> You can review, update, or export your account profile information anytime in the Profile Dashboard.</p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#789d53] hover:bg-[#6c8e4a] rounded-lg transition-colors shadow-xs"
            >
              I Agree & Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
