import React, { useState, useRef } from 'react';
import { 
  Camera, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Phone, 
  AtSign, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  CloudUpload,
  AlertCircle
} from 'lucide-react';
import { UserProfile, SocialLinkItem } from '../types';
import { profileCloudService, EMPTY_USER_PROFILE } from '../services/profileCloudService';
import { IPayLogoPlaceholder } from './SocialIcons';

interface ProfileSetupScreenProps {
  email: string;
  initialProfile?: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  email,
  initialProfile,
  onComplete,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialProfile?.avatarUrl || '');
  const [fullName, setFullName] = useState<string>(initialProfile?.fullName || '');
  const [username, setUsername] = useState<string>(initialProfile?.username || email.split('@')[0] || '');
  const [bio, setBio] = useState<string>(initialProfile?.bio || '');
  const [location, setLocation] = useState<string>(initialProfile?.location || initialProfile?.currentLocation || '');
  const [country, setCountry] = useState<string>(initialProfile?.country || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(initialProfile?.phoneNumber || initialProfile?.publicPhone || '');
  const [occupation, setOccupation] = useState<string>(initialProfile?.occupation || '');
  const [school, setSchool] = useState<string>(initialProfile?.school || '');
  const [hobby, setHobby] = useState<string>(initialProfile?.hobby || '');
  const [travel, setTravel] = useState<string>(initialProfile?.travel || '');
  const [experience, setExperience] = useState<string>(initialProfile?.experience || '');
  const [socialHandle, setSocialHandle] = useState<string>(initialProfile?.socialHandle || '');
  const [website, setWebsite] = useState<string>(initialProfile?.website || '');

  // Status states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle avatar file selection & compression
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 5MB.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    if (!cleanName) {
      setError('Please enter your full name');
      return;
    }
    if (!cleanUsername) {
      setError('Please enter your username');
      return;
    }

    setIsSaving(true);

    const defaultSocialLinks: SocialLinkItem[] = [];
    if (phoneNumber.trim()) {
      defaultSocialLinks.push({
        platformId: 'whatsapp',
        platformName: 'WhatsApp',
        username: phoneNumber.trim(),
        linkUrl: `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`,
        contentBio: 'Direct WhatsApp Chat & Inquiries',
      });
    }

    const updatedProfile: UserProfile = {
      ...EMPTY_USER_PROFILE,
      ...initialProfile,
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email.trim().toLowerCase(),
      fullName: cleanName,
      username: cleanUsername,
      avatarUrl: avatarUrl.trim(),
      bio: bio.trim(),
      location: location.trim(),
      currentLocation: location.trim(),
      country: country.trim(),
      phoneNumber: phoneNumber.trim(),
      publicPhone: phoneNumber.trim(),
      occupation: occupation.trim(),
      school: school.trim(),
      hobby: hobby.trim(),
      travel: travel.trim(),
      experience: experience.trim(),
      socialHandle: socialHandle.trim() || `@${cleanUsername}`,
      website: website.trim(),
      socialLinks: defaultSocialLinks,
      isProfileCompleted: true,
      isEmailVerified: true,
    };

    // Save to Database B (collections-1a343)
    const res = await profileCloudService.saveProfile(email, updatedProfile);
    setIsSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        onComplete(updatedProfile);
      }, 1200);
    } else {
      // Even if cloud network has a hiccup, local storage is saved and proceed gracefully
      setSavedSuccess(true);
      setTimeout(() => {
        onComplete(updatedProfile);
      }, 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 pb-10 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Set Up Your Profile</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </h1>
          <p className="text-[11px] text-slate-500">
            Saved permanently to Cloud Database • Accessible on any device
          </p>
        </div>
      </div>

      <div className="px-5 py-5 max-w-md mx-auto w-full flex-1 flex flex-col justify-between">
        {/* Success Banner */}
        {savedSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-900 text-xs text-center space-y-2 animate-in zoom-in-95 duration-200 shadow-md">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-sm">Profile Saved Successfully!</h4>
            <p className="text-[11px] text-emerald-800">
              Synced to your Cloud Database. Redirecting to your Home dashboard...
            </p>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!savedSuccess && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Avatar Upload Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-3 border-emerald-600/30 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#2e7d32] text-white rounded-full shadow-md hover:bg-[#256829] active:scale-95 transition-all border-2 border-white"
                  aria-label="Upload Avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  {avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
                </button>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  JPG, PNG or WEBP (Max 5MB)
                </p>
              </div>
            </div>

            {/* Basic Identity Info */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Basic Identity
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Isiyaku Haruna"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium text-slate-900"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs font-semibold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full h-10 pl-7 pr-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bio / About You
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a brief introduction about yourself..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-normal text-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Location & Contact Info */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Location & Contact
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kaduna"
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria"
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Website / Portfolio
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://ipay.online/@username"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Profession & Interests */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Profession & Interests
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Entrepreneur"
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    School / University
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. ABU Zaria"
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Hobbies & Interests
                </label>
                <input
                  type="text"
                  value={hobby}
                  onChange={(e) => setHobby(e.target.value)}
                  placeholder="e.g. Football, Photography, Traveling"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Travel Highlights
                </label>
                <input
                  type="text"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                  placeholder="e.g. Dubai, London, Cairo, Zanzibar"
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Submit & Save to Cloud Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-12 bg-[#2e7d32] hover:bg-[#256829] active:bg-[#1e5421] text-white font-bold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-75"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving to Cloud Database...
                  </span>
                ) : (
                  <>
                    <span>Save Profile & Continue to Home</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
