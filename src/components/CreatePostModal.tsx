import React, { useState, useRef } from 'react';
import { X, Image, Film, Music, ShoppingBag, Plus, Upload, Check } from 'lucide-react';
import { ContentTab, PostItem } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: PostItem) => void;
  activeType: ContentTab;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onAddPost,
  activeType,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'posts' | 'reels' | 'films' | 'musics' | 'products'>(
    activeType === 'all' ? 'posts' : (activeType as any) || 'posts'
  );
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim() && !mediaPreview) return;

    const newPost: PostItem = {
      id: `post_${Date.now()}`,
      type,
      title: title.trim() || 'Creator Post',
      description: description.trim() || title.trim(),
      mediaUrl: mediaPreview,
      mediaType: mediaPreview ? 'image' : 'none',
      likes: 0,
      comments: 0,
      createdAt: 'Just now',
      authorName: 'Isiyaku Haruna',
      authorUsername: 'isiyaku_online',
      authorAvatar: '',
      commentsList: [],
    };

    onAddPost(newPost);
    setTitle('');
    setDescription('');
    setMediaPreview('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Upload Creator Content</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Content Category</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'posts', label: 'Post' },
                { id: 'reels', label: 'Reel' },
                { id: 'films', label: 'Film' },
                { id: 'musics', label: 'Music' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    type === t.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Photography Presets, Studio Session..."
              className="w-full h-11 px-3.5 border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Story / Caption (Facebook Style)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your creation..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-slate-900 focus:outline-none text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Media File</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center p-3"
            >
              {mediaPreview ? (
                <div className="relative max-h-36 rounded-xl overflow-hidden">
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaPreview('');
                    }}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Upload className="w-6 h-6 mb-1 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-700">Choose Media from Device</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleMediaUpload}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2e7d32] hover:bg-[#256829] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
