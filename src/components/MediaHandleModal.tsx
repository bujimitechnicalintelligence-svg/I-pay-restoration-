import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check, ExternalLink, Link2, Plus, Trash2, X } from 'lucide-react';
import { SOCIAL_PLATFORMS, SocialPlatform } from './SocialIcons';

export interface SocialHandleEntry {
  platformId: string;
  platformName: string;
  username: string;
  linkUrl: string;
  contentBio: string;
}

interface MediaHandleModalProps {
  isOpen: boolean;
  currentValue: string;
  initialHandles?: SocialHandleEntry[];
  onClose: () => void;
  onSave: (summary: string, handles: SocialHandleEntry[]) => void;
}

export const MediaHandleModal: React.FC<MediaHandleModalProps> = ({
  isOpen,
  currentValue,
  initialHandles,
  onClose,
  onSave,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  
  // Existing handles or newly added
  const [handles, setHandles] = useState<SocialHandleEntry[]>([]);

  useEffect(() => {
    if (initialHandles && initialHandles.length > 0) {
      setHandles(initialHandles);
    } else {
      setHandles([
        {
          platformId: 'facebook',
          platformName: 'Facebook',
          username: 'Isiyaku Haruna',
          linkUrl: 'https://facebook.com/isiyaku',
          contentBio: 'Official Facebook Profile & Creator Page',
        },
        {
          platformId: 'whatsapp',
          platformName: 'WhatsApp',
          username: '+234 803 123 4567',
          linkUrl: 'https://wa.me/2348031234567',
          contentBio: 'Direct WhatsApp Chat & Business inquiries',
        },
      ]);
    }
  }, [initialHandles, isOpen]);

  // Current editing form state
  const [formUsername, setFormUsername] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formContent, setFormContent] = useState('');

  if (!isOpen) return null;

  const filteredPlatforms = SOCIAL_PLATFORMS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPlatform = (p: SocialPlatform) => {
    setSelectedPlatform(p);
    const existing = handles.find((h) => h.platformId === p.id);
    if (existing) {
      setFormUsername(existing.username);
      setFormLink(existing.linkUrl);
      setFormContent(existing.contentBio);
    } else {
      setFormUsername('');
      setFormLink(p.defaultPrefix);
      setFormContent('');
    }
  };

  const handleSaveCurrentPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !formUsername.trim()) return;

    const newEntry: SocialHandleEntry = {
      platformId: selectedPlatform.id,
      platformName: selectedPlatform.name,
      username: formUsername.trim(),
      linkUrl: formLink.trim() || `${selectedPlatform.defaultPrefix}${formUsername.trim()}`,
      contentBio: formContent.trim(),
    };

    const updated = [...handles.filter((h) => h.platformId !== selectedPlatform.id), newEntry];
    setHandles(updated);
    setSelectedPlatform(null);
  };

  const handleDeleteHandle = (platformId: string) => {
    setHandles(handles.filter((h) => h.platformId !== platformId));
  };

  const handleCompleteAll = () => {
    const summary = handles.map((h) => `${h.platformName}: ${h.username}`).join(' • ');
    onSave(summary || '@isiyaku_online', handles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col overflow-y-auto animate-in slide-in-from-bottom-3 duration-200">
      
      {/* Full Screen Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2]" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900">
          Media & Social Handles ({handles.length})
        </h1>
        <button
          type="button"
          onClick={handleCompleteAll}
          className="px-5 py-2 bg-[#2e7d32] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#256829] shadow-xs flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Save & Done</span>
        </button>
      </div>

      <div className="flex-1 p-5 max-w-lg mx-auto w-full space-y-6 pb-24">
        
        {/* Connected Handles List */}
        {handles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Connected Channels ({handles.length})
              </h2>
              <span className="text-[11px] text-slate-400">All visible on profile</span>
            </div>

            <div className="space-y-3">
              {handles.map((h) => {
                const platform = SOCIAL_PLATFORMS.find((p) => p.id === h.platformId);
                return (
                  <div
                    key={h.platformId}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                        {platform?.iconSvg}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{h.platformName}</span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5 break-words">
                          {h.username}
                        </div>
                        {h.contentBio && (
                          <div className="text-xs text-slate-600 mt-1 italic leading-relaxed">
                            "{h.contentBio}"
                          </div>
                        )}
                        <a
                          href={h.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-1.5 font-semibold break-all"
                        >
                          <Link2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{h.linkUrl}</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectPlatform(platform || SOCIAL_PLATFORMS[0])}
                        className="px-2.5 py-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHandle(h.platformId)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        title="Delete handle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form to configure selected platform */}
        {selectedPlatform ? (
          <div className="p-5 bg-white rounded-3xl border-2 border-emerald-600 shadow-md space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  {selectedPlatform.iconSvg}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Configure {selectedPlatform.name}</h3>
                  <p className="text-xs text-slate-500">Provide username/number, direct URL and description</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlatform(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentPlatform} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Name / Username / Number in {selectedPlatform.name}
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder={
                    selectedPlatform.id === 'whatsapp'
                      ? '+234 803 123 4567'
                      : '@your_handle'
                  }
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none font-semibold text-slate-900"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Direct Profile or Chat URL
                </label>
                <input
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder={`${selectedPlatform.defaultPrefix}username`}
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Description / Channel Bio (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="e.g. Official creator channel, DM for collaboration or bookings..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(null)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2e7d32] text-white font-bold rounded-xl hover:bg-[#256829] shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save {selectedPlatform.name}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Search & List of Available Social Platforms */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Add Another Social Platform
              </h2>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Facebook, WhatsApp, Instagram, TikTok, X, Telegram..."
                className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-300 rounded-2xl focus:border-slate-900 focus:bg-white focus:outline-none text-sm transition-all shadow-xs"
              />
            </div>

            {/* Grid of Platforms with Real Logos */}
            <div className="grid grid-cols-2 gap-3">
              {filteredPlatforms.map((platform) => {
                const isAdded = handles.some((h) => h.platformId === platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handleSelectPlatform(platform)}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center gap-3 text-left shadow-xs group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {platform.iconSvg}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {platform.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {isAdded ? '✓ Added (Edit)' : '+ Connect'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
