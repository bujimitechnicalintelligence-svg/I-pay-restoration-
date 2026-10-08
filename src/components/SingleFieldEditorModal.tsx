import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

export type EditableFieldKey = 
  | 'hobby' 
  | 'country' 
  | 'currentLocation' 
  | 'lifeStatus' 
  | 'travel' 
  | 'bio' 
  | 'experience' 
  | 'school' 
  | 'occupation' 
  | 'socialHandle' 
  | 'publicPhone' 
  | 'monetization' 
  | 'website'
  | 'fullName'
  | 'username';

interface FieldConfig {
  label: string;
  icon: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  placeholder: string;
  description?: string;
}

const FIELD_CONFIGS: Record<EditableFieldKey, FieldConfig> = {
  hobby: {
    label: 'Hobbies & Passions',
    icon: '⚽',
    type: 'textarea',
    placeholder: 'e.g. Football, Playing Music, Photography, Traveling, Swimming...',
    description: 'Share your favorite hobbies and interests with your community.',
  },
  country: {
    label: 'Country of Origin / Residence',
    icon: '🌍',
    type: 'text',
    placeholder: 'e.g. Nigeria, Ghana, United States, United Kingdom, Kenya...',
    description: 'Your home country or primary place of residence.',
  },
  currentLocation: {
    label: 'Current Location',
    icon: '📍',
    type: 'text',
    placeholder: 'e.g. Kaduna, Abuja, Lagos, London...',
    description: 'Where you are currently residing, based, or working.',
  },
  lifeStatus: {
    label: 'Life & Relationship Status',
    icon: '💍',
    type: 'select',
    options: ['Single', 'Married', 'Widow', 'Widower', 'In a relationship', 'Engaged', 'Divorced', 'Separated'],
    placeholder: 'Select life status',
    description: 'Your current relationship or marital status.',
  },
  travel: {
    label: 'Travel & Visited Destinations',
    icon: '✈️',
    type: 'text',
    placeholder: 'e.g. Dubai, London, Cairo, Zanzibar, Paris, Nairobi...',
    description: 'Countries, cities, or places you have visited or explored.',
  },
  bio: {
    label: 'About Story / Biography',
    icon: '📝',
    type: 'textarea',
    placeholder: 'Write your story, background, vision, or personal message here. You can write no matter how long it is without character limits...',
    description: 'A complete biography and story. Multi-line paragraphs and detailed text are fully supported.',
  },
  experience: {
    label: 'Professional Experience',
    icon: '💼',
    type: 'text',
    placeholder: 'e.g. 2 years creator, 5 years software engineer, business founder...',
    description: 'Your career milestones, experience level, or creative background.',
  },
  school: {
    label: 'School / University',
    icon: '🎓',
    type: 'text',
    placeholder: 'e.g. ABU Zaria, University of Lagos, Harvard...',
    description: 'Your alma mater or educational institutions.',
  },
  occupation: {
    label: 'Occupation / Role',
    icon: '🤍',
    type: 'text',
    placeholder: 'e.g. Entrepreneur, Digital Creator, Engineer, Merchant...',
    description: 'Your main profession, business role, or creative title.',
  },
  socialHandle: {
    label: 'Media Handle / Socials',
    icon: '🌐',
    type: 'text',
    placeholder: 'e.g. @isiyaku_online (Facebook, WhatsApp, TikTok, X, Instagram)...',
    description: 'Your primary media handles and social channel presence.',
  },
  publicPhone: {
    label: 'Public Contact Phone Number',
    icon: '📞',
    type: 'text',
    placeholder: 'e.g. +234 803 123 4567',
    description: 'Phone number visible on your profile for business and inquiries.',
  },
  monetization: {
    label: 'Account Type / Monetization Tier',
    icon: '💎',
    type: 'select',
    options: ['Free Account', 'Monetized Creator', 'Pro Business'],
    placeholder: 'Select account monetization tier',
    description: 'Enables monetization, tips, and creator marketplace features.',
  },
  website: {
    label: 'Personal or Business Website',
    icon: '🔗',
    type: 'text',
    placeholder: 'e.g. https://yourwebsite.com or https://ipay.online/@user',
    description: 'External link to your portfolio, store, or personal website.',
  },
  fullName: {
    label: 'Full Name',
    icon: '👤',
    type: 'text',
    placeholder: 'e.g. Isiyaku Haruna',
    description: 'Your display name shown at the top of your profile.',
  },
  username: {
    label: 'Username',
    icon: '🏷️',
    type: 'text',
    placeholder: 'username',
    description: 'Unique @handle for your I-pay account.',
  },
};

interface SingleFieldEditorModalProps {
  fieldKey: EditableFieldKey | null;
  currentValue: string;
  onClose: () => void;
  onSave: (fieldKey: EditableFieldKey, value: string) => void;
}

export const SingleFieldEditorModal: React.FC<SingleFieldEditorModalProps> = ({
  fieldKey,
  currentValue,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(currentValue || '');

  useEffect(() => {
    setValue(currentValue || '');
  }, [currentValue, fieldKey]);

  if (!fieldKey) return null;

  const config = FIELD_CONFIGS[fieldKey] || {
    label: 'Edit Detail',
    icon: '🖊️',
    type: 'text',
    placeholder: 'Enter details...',
    description: '',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(fieldKey, value.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white min-h-screen flex flex-col overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
      {/* Full Screen Top Navigation Bar */}
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
          Edit {config.label}
        </h1>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 bg-[#2e7d32] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#256829] shadow-xs flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      {/* Full Screen Form Body */}
      <div className="flex-1 p-5 max-w-lg mx-auto w-full flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header Info Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3.5">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{config.label}</h2>
              {config.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {config.description}
                </p>
              )}
            </div>
          </div>

          {/* Form Control */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Enter {config.label}
            </label>

            {config.type === 'textarea' ? (
              <textarea
                rows={fieldKey === 'bio' ? 10 : 6}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={config.placeholder}
                className="w-full p-4 text-sm sm:text-base border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 leading-relaxed shadow-inner"
                autoFocus
              />
            ) : config.type === 'select' ? (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-14 px-4 text-base border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none bg-white font-semibold shadow-xs"
                autoFocus
              >
                {config.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={config.placeholder}
                className="w-full h-14 px-4 text-base border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 font-medium shadow-xs"
                autoFocus
              />
            )}
          </div>
        </form>

        {/* Bottom Save Action */}
        <div className="pt-8 pb-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 bg-[#2e7d32] hover:bg-[#256829] text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Save & Update Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
