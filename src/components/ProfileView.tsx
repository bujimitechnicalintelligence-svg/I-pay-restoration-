import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Pencil, 
  Camera, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Globe, 
  Phone, 
  Award, 
  AtSign, 
  Plus, 
  Share2, 
  Check, 
  ExternalLink,
  Plane,
  Flag,
  Navigation,
  Sparkles,
  FileText,
  Eye
} from 'lucide-react';
import { UserProfile, ContentTab, PostItem } from '../types';
import { EditProfileModal } from './EditProfileModal';
import { CreatePostModal } from './CreatePostModal';
import { SingleFieldEditorModal, EditableFieldKey } from './SingleFieldEditorModal';
import { MediaHandleModal, SocialHandleEntry } from './MediaHandleModal';
import { SOCIAL_PLATFORMS } from './SocialIcons';

interface ProfileViewProps {
  user: UserProfile;
  posts: PostItem[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddPost: (post: PostItem) => void;
  onOpenSettings?: () => void;
  isVisitor?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts,
  onUpdateUser,
  onAddPost,
  onOpenSettings,
  isVisitor = false,
}) => {
  const [activeTab, setActiveTab] = useState<ContentTab>('posts');
  const [isFullEditModalOpen, setIsFullEditModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  // Single field editing state
  const [activeSingleField, setActiveSingleField] = useState<EditableFieldKey | null>(null);
  const [isMediaHandleModalOpen, setIsMediaHandleModalOpen] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateUser({ avatarUrl: reader.result });
          showToast('Profile photo updated from device!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = user.website || `https://ipay.online/@${user.username || 'user'}`;
    navigator.clipboard?.writeText(profileUrl);
    showToast('Profile link copied to clipboard!');
  };

  const handleSaveSingleField = (fieldKey: EditableFieldKey, value: string) => {
    const update: Partial<UserProfile> = {
      [fieldKey]: value,
    };
    if (fieldKey === 'currentLocation') {
      update.location = value;
    }
    onUpdateUser(update);
    showToast(`${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} updated!`);
  };

  // Filter posts by active tab
  const filteredPosts = posts.filter((p) => p.type === activeTab);

  const getSingleFieldValue = (key: EditableFieldKey | null): string => {
    if (!key) return '';
    return (user[key as keyof UserProfile] as string) || '';
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 pb-32 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="sticky top-0 z-50 bg-[#2e7d32] text-white px-5 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md animate-in slide-in-from-top">
          <div className="flex items-center gap-2 truncate">
            <Check className="w-4 h-4 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white px-1">✕</button>
        </div>
      )}

      {/* Top Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-30">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {isVisitor ? `${user.fullName || user.username || 'User'}'s Profile` : 'Profile'}
        </h1>
        {!isVisitor && (
          <button
            type="button"
            onClick={onOpenSettings || (() => setIsFullEditModalOpen(true))}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 stroke-[1.85]" />
          </button>
        )}
      </div>

      <div className="px-5 sm:px-6 pt-5 flex flex-col items-center w-full">
        
        {/* Avatar: Enlarged with device file upload trigger */}
        <div className="relative my-3">
          <div 
            onClick={() => { if (!isVisitor) fileInputRef.current?.click(); }}
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-3 ${isVisitor ? 'border-solid border-slate-300' : 'border-dashed border-slate-400 cursor-pointer'} bg-slate-50 flex items-center justify-center overflow-hidden group shadow-inner transition-transform ${!isVisitor ? 'hover:scale-105 active:scale-95' : ''}`}
            title={!isVisitor ? "Click to upload photo from your device" : undefined}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-700">
                <Camera className="w-10 h-10 mb-1" />
                <span className="text-xs font-semibold">{isVisitor ? 'No Photo' : 'Upload Photo'}</span>
              </div>
            )}
          </div>

          {/* Quick pencil edit button on avatar */}
          {!isVisitor && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-[#2e7d32] text-white p-2.5 rounded-full shadow-lg hover:bg-[#256829] transition-transform hover:scale-110 active:scale-95"
              title="Upload photo from device"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFile}
          />
        </div>

        {/* User Name Pill */}
        <div className="mt-3 flex items-center gap-2">
          <div className="px-7 py-2 bg-slate-200/90 rounded-full text-base sm:text-lg font-bold text-slate-900 tracking-wide text-center shadow-xs">
            {user.fullName || 'User Name'}
          </div>
          {!isVisitor && (
            <button
              type="button"
              onClick={() => setActiveSingleField('fullName')}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-full"
              title="Edit Name"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* @username Pill */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="px-5 py-1 bg-slate-100 rounded-full text-xs sm:text-sm font-semibold text-slate-700 text-center border border-slate-200">
            @{user.username || 'username'}
          </div>
          {!isVisitor && (
            <button
              type="button"
              onClick={() => setActiveSingleField('username')}
              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-full"
              title="Edit Username"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Long Story / Bio Card - Fully displayed with zero character limit or cutoffs */}
        <div className="w-full my-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-xs relative group">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              Biography & Story
            </span>
            {!isVisitor && (
              <button
                type="button"
                onClick={() => setActiveSingleField('bio')}
                className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 p-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Story</span>
              </button>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line text-left break-words">
            {user.bio || (
              <span className="text-slate-400 italic font-normal">
                No bio added yet. Click edit story to introduce yourself, write your personal message, or share your background...
              </span>
            )}
          </p>
        </div>

        {/* Stats Row: Swipeable with Posts, Followers, Following & Seen Eye Watches */}
        <div className="w-full my-2">
          <div className="text-[11px] text-slate-400 font-medium px-1 mb-1.5 flex items-center justify-between">
            <span>Creator Activity & Stats</span>
            <span className="text-[10px] text-slate-400">Swipe to view all ↔</span>
          </div>

          <div className="w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2.5 sm:grid sm:grid-cols-4 border-y border-slate-200 py-3.5 px-1 text-center snap-x">
            
            {/* 1. Posts */}
            <div className="min-w-[100px] sm:min-w-0 flex-1 bg-slate-50/60 rounded-2xl p-2.5 border border-slate-200/60 snap-start">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{posts.length || user.postsCount || 0}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Posts</div>
            </div>

            {/* 2. Followers (default 0) */}
            <div className="min-w-[100px] sm:min-w-0 flex-1 bg-slate-50/60 rounded-2xl p-2.5 border border-slate-200/60 snap-start">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{user.followersCount || 0}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Followers</div>
            </div>

            {/* 3. Following */}
            <div className="min-w-[100px] sm:min-w-0 flex-1 bg-slate-50/60 rounded-2xl p-2.5 border border-slate-200/60 snap-start">
              <div className="text-lg sm:text-xl font-bold text-slate-900">{user.followingCount || 0}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Following</div>
            </div>

            {/* 4. 👁️ Watches / Profile Views with Seen Eye */}
            <div className="min-w-[110px] sm:min-w-0 flex-1 bg-emerald-50/50 rounded-2xl p-2.5 border border-emerald-200/70 snap-start">
              <div className="text-lg sm:text-xl font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>{user.watchesCount || 0}</span>
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">Watches</div>
            </div>

          </div>
        </div>

        {/* About & Lifestyle Section - Full Text Visibility (No ellipsis / truncation) */}
        <div className="w-full mt-3 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">About & Details</h2>
            {!isVisitor && (
              <button
                type="button"
                onClick={() => setIsFullEditModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit All</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm sm:text-base text-slate-800">
            
            {/* ⚽ Hobbies & Passions */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col gap-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="text-lg">⚽</span> Hobbies & Passions:
                </span>
                {!isVisitor && (
                  <button 
                    type="button"
                    onClick={() => setActiveSingleField('hobby')}
                    className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Edit Hobbies"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-sm sm:text-base font-semibold text-slate-900 pl-7 leading-relaxed break-words whitespace-normal">
                {user.hobby || <span className="text-slate-400 italic font-normal">Not specified yet</span>}
              </div>
            </div>

            {/* 🌍 Country */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Flag className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Country:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5">
                    {user.country || <span className="text-slate-400 italic font-normal">Not set yet</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('country')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Country"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 📍 Current Location */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Navigation className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Current Location:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5">
                    {user.currentLocation || user.location || <span className="text-slate-400 italic font-normal">Kaduna, Nigeria</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('currentLocation')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Location"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 💍 Life Status */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-lg shrink-0 mt-0.5">💍</span>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Life Status:</span>
                  <div className="mt-1">
                    <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-xl text-xs sm:text-sm inline-block break-words">
                      {user.lifeStatus || 'Single'}
                    </span>
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('lifeStatus')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Life Status"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ✈️ Travel & Destinations */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Plane className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Travel & Destinations:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5">
                    {user.travel || <span className="text-slate-400 italic font-normal">Dubai, London, Cairo, Zanzibar</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('travel')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Travel"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 💼 Experience */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Briefcase className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Experience:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5">
                    {user.experience || <span className="text-slate-400 italic font-normal">2 years creator</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('experience')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Experience"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 🎓 School - 100% visible, no cutting off */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <GraduationCap className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">School:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5 leading-relaxed">
                    {user.school || <span className="text-slate-400 italic font-normal">ABU Zaria</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('school')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit School"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 🤍 Occupation */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-lg shrink-0 mt-0.5">🤍</span>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Occupation:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5">
                    {user.occupation || <span className="text-slate-400 italic font-normal">Entrepreneur</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('occupation')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Occupation"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 🌐 Media Handles & Connected Channels */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <AtSign className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Connected Social Channels ({user.socialLinks?.length || (user.socialHandle ? 1 : 0)})
                  </span>
                </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setIsMediaHandleModalOpen(true)}
                  className="text-emerald-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Manage Handles</span>
                </button>
              )}
              </div>

              {user.socialLinks && user.socialLinks.length > 0 ? (
                <div className="space-y-2.5">
                  {user.socialLinks.map((item, idx) => {
                    const platform = SOCIAL_PLATFORMS.find((p) => p.id === item.platformId);
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          {platform?.iconSvg}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900">{item.platformName}</span>
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Connected
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 break-words">
                            {item.username}
                          </div>
                          {item.contentBio && (
                            <div className="text-xs text-slate-500 mt-0.5 italic">
                              "{item.contentBio}"
                            </div>
                          )}
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-1 font-semibold break-all"
                          >
                            <span>{item.linkUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">{user.socialHandle || '@isiyaku_online'}</span>
                  <button
                    type="button"
                    onClick={() => setIsMediaHandleModalOpen(true)}
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    + Add Facebook, WhatsApp, etc.
                  </button>
                </div>
              )}
            </div>

            {/* 📞 Public Phone */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Phone className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Public Phone:</span>
                  <div className="font-bold text-slate-900 break-words whitespace-normal mt-0.5">
                    {user.publicPhone || <span className="text-slate-400 italic font-normal">+234 800 000 0000</span>}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('publicPhone')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Public Phone"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 💎 Account Monetization */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Account Tier:</span>
                  <div className="mt-1">
                    <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs sm:text-sm inline-block">
                      {user.monetization || 'Free Account'}
                    </span>
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('monetization')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Monetization"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 🔗 Website */}
            <div className="flex items-start justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-2">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Globe className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 text-xs sm:text-sm font-semibold block">Website:</span>
                  <div className="mt-0.5 break-words whitespace-normal">
                    {user.website ? (
                      <a
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1.5 break-all text-sm sm:text-base"
                      >
                        <span>{user.website}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic font-normal">Add website link</span>
                    )}
                  </div>
                </div>
              </div>
              {!isVisitor && (
                <button 
                  type="button"
                  onClick={() => setActiveSingleField('website')}
                  className="text-slate-400 hover:text-emerald-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Edit Website"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs: Posts | Reels | Films | Musics | Products */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-around border-b border-slate-200 text-sm sm:text-base font-bold text-slate-500">
            {(['posts', 'reels', 'films', 'musics', 'products'] as ContentTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-2 capitalize transition-colors relative ${
                    isActive ? 'text-slate-900 font-bold' : 'hover:text-slate-700 font-medium'
                  }`}
                >
                  {tab}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Grid Area */}
          <div className="pt-4">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                  >
                    {post.mediaUrl ? (
                      <div className="w-full h-48 sm:h-52 rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                        <span className="text-4xl">
                          {activeTab === 'reels' ? '🎬' : activeTab === 'musics' ? '🎵' : activeTab === 'products' ? '🛍️' : '📄'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                        {post.title}
                      </div>
                      {post.description && (
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1">
                          {post.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span>{post.createdAt}</span>
                      <span className="text-red-500 font-bold">{post.likes} ❤️</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="w-full py-10 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
                  <Plus className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  No {activeTab} yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-[260px] mt-1 leading-relaxed">
                  Share your first {activeTab.slice(0, -1)} with your followers and community.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreatePostOpen(true)}
                  className="mt-4 px-5 py-2.5 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white text-xs sm:text-sm font-semibold rounded-2xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create {activeTab.slice(0, -1)}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Edit Profile & Share Profile */}
        <div className="w-full flex items-center gap-4 pt-8 pb-4">
          <button
            type="button"
            onClick={() => setIsFullEditModalOpen(true)}
            className="flex-1 h-12 border-2 border-slate-800 bg-white text-slate-900 font-bold text-sm sm:text-base rounded-full transition-all shadow-sm hover:bg-slate-900 hover:text-white active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={handleShareProfile}
            className="flex-1 h-12 border-2 border-slate-800 bg-white text-slate-900 font-bold text-sm sm:text-base rounded-full transition-all shadow-sm hover:bg-slate-900 hover:text-white active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Profile</span>
          </button>
        </div>

      </div>

      {/* Single Field Editor Modal (Opens ONLY the clicked field!) */}
      <SingleFieldEditorModal
        fieldKey={activeSingleField}
        currentValue={getSingleFieldValue(activeSingleField)}
        onClose={() => setActiveSingleField(null)}
        onSave={handleSaveSingleField}
      />

      {/* Media Handle Full-Screen Selector & Editor */}
      <MediaHandleModal
        isOpen={isMediaHandleModalOpen}
        currentValue={user.socialHandle}
        initialHandles={user.socialLinks}
        onClose={() => setIsMediaHandleModalOpen(false)}
        onSave={(summary, handles) => {
          onUpdateUser({ 
            socialHandle: summary,
            socialLinks: handles 
          });
          showToast('Media handles updated successfully!');
        }}
      />

      {/* Full Profile Edit Modal */}
      <EditProfileModal
        isOpen={isFullEditModalOpen}
        onClose={() => setIsFullEditModalOpen(false)}
        user={user}
        onSave={(updated) => {
          onUpdateUser(updated);
          showToast('Profile updated successfully!');
        }}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onAddPost={(newPost) => {
          onAddPost(newPost);
          showToast('New content published!');
        }}
        activeType={activeTab}
      />
    </div>
  );
};
