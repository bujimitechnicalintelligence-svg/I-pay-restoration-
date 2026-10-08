import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  Globe, 
  Phone, 
  Award, 
  AtSign, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Smile, 
  FileText,
  Heart,
  Plane,
  Flag,
  Navigation
} from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  initialFocusField?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [bio, setBio] = useState(user.bio || '');
  const [hobby, setHobby] = useState(user.hobby || '');
  const [country, setCountry] = useState(user.country || 'Nigeria');
  const [currentLocation, setCurrentLocation] = useState(user.currentLocation || user.location || 'Kaduna, Nigeria');
  const [lifeStatus, setLifeStatus] = useState(user.lifeStatus || 'Single');
  const [travel, setTravel] = useState(user.travel || '');
  const [experience, setExperience] = useState(user.experience || '');
  const [school, setSchool] = useState(user.school || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [socialHandle, setSocialHandle] = useState(user.socialHandle || '');
  const [publicPhone, setPublicPhone] = useState(user.publicPhone || '');
  const [monetization, setMonetization] = useState(user.monetization || 'Free Account');
  const [website, setWebsite] = useState(user.website || '');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: fullName.trim(),
      username: username.trim().replace(/^@/, ''),
      avatarUrl,
      bio: bio.trim(),
      hobby: hobby.trim(),
      country: country.trim(),
      currentLocation: currentLocation.trim(),
      location: currentLocation.trim(),
      lifeStatus: lifeStatus.trim(),
      travel: travel.trim(),
      experience: experience.trim(),
      school: school.trim(),
      occupation: occupation.trim(),
      socialHandle: socialHandle.trim(),
      publicPhone: publicPhone.trim(),
      monetization,
      website: website.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Profile & Personal Info</h2>
            <p className="text-xs text-slate-500">Customize your public information, hobbies, and about bio</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center pb-3 border-b border-slate-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 bg-slate-50 overflow-hidden flex items-center justify-center shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-slate-400 flex flex-col items-center">
                    <Camera className="w-7 h-7 mb-1 text-slate-400" />
                    <span className="text-[10px] font-medium">Add Photo</span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#2e7d32] text-white p-2 rounded-full shadow-md hover:bg-[#256829] transition-transform hover:scale-105 active:scale-95"
                title="Upload Photo from Device"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload photo from device
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Isiyaku Haruna"
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full h-10 pl-7 pr-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Long Bio / About Description (Can be as long as desired!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>About Description / Story</span>
              <span className="text-[10px] text-slate-400 font-normal">No character limit</span>
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your full story, bio, introduction, or message. You can write no matter how long it is and it will be fully displayed..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Personal & Lifestyle Info */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              Lifestyle, Country & Personal Status
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-emerald-600" /> Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Nigeria, Ghana, USA..."
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>

              {/* Current Location */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" /> Current Location
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. Kaduna, Abuja, London..."
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Life Status (Married, Widow, Single, etc.) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <span>💍</span> Life / Relationship Status
                </label>
                <select
                  value={lifeStatus}
                  onChange={(e) => setLifeStatus(e.target.value)}
                  className="w-full h-10 px-2.5 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none bg-white font-medium"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widow">Widow</option>
                  <option value="Widower">Widower</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Engaged">Engaged</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>

              {/* Travel / Visited Places */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 text-indigo-600" /> Travel & Destinations
                </label>
                <input
                  type="text"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                  placeholder="e.g. Dubai, London, Cairo, Zanzibar..."
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Hobbies & Interests (Expanded) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <span>⚽</span> Hobbies & Passions
              </label>
              <textarea
                rows={2}
                value={hobby}
                onChange={(e) => setHobby(e.target.value)}
                placeholder="Football, Playing Music, Photography, Traveling, Coding, Reading, Swimming..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Education & Career */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-600" />
              Career & Education
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Experience */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Experience
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 2 years creator"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> School / University
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. ABU Zaria"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <span>🤍</span> Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Entrepreneur, Software Engineer, Merchant..."
                className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Social, Monetization & Contact */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              Media, Contact & Monetization
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Media handle */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-slate-500" /> Media Handle
                </label>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@isiyaku_online"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>

              {/* Public Phone */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Public Phone
                </label>
                <input
                  type="tel"
                  value={publicPhone}
                  onChange={(e) => setPublicPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Account Monetization */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Account Type / Monetization
                </label>
                <select
                  value={monetization}
                  onChange={(e) => setMonetization(e.target.value as any)}
                  className="w-full h-10 px-2.5 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none bg-white font-medium"
                >
                  <option value="Free Account">Free Account</option>
                  <option value="Monetized Creator">Monetized Creator</option>
                  <option value="Pro Business">Pro Business</option>
                </select>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://ipay.online"
                  className="w-full h-10 px-3 text-xs border border-slate-300 rounded-xl focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2e7d32] hover:bg-[#256829] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
