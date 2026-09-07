import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  User as UserIcon,
  Mail,
  Shield,
  Briefcase,
  Phone,
  Camera,
  CheckCircle2,
  Sparkles,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import api from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState<string>(user?.name || '');
  const [title, setTitle] = useState<string>(user?.title || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [avatarInputMode, setAvatarInputMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTitle(user.title || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be under 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          showToast('Profile picture selected', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        title: title.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });

      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast('Failed to update profile', 'error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-400" /> My Profile & Preferences
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal profile, display avatar, contact information, and role settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Account Role: {user?.role || 'Sales'}
          </span>
        </div>
      </div>

      <div className="grid grid-[#0f172a] lg:grid-cols-3 gap-8">
        {/* Left Column: Live Avatar & Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Live Profile Picture / Avatar */}
            <div className="relative inline-block mx-auto">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || 'User Avatar'}
                  className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-2xl mx-auto"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-slate-800 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl mx-auto">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full text-white shadow-lg border-2 border-slate-900">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{name || 'Your Name'}</h2>
              <p className="text-xs text-blue-400 font-medium mt-0.5">{title || 'Export Specialist'}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {user?.email}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-left space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" /> Permission Level
                </span>
                <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Status
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active User
                </span>
              </div>
              {phone && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone
                  </span>
                  <span className="font-mono text-slate-200">{phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-400" /> Edit Personal Information
            </h3>

            {/* Name & Title */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
                icon={<UserIcon className="w-4 h-4" />}
              />
              <Input
                label="Job Title / Position"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Export Sales Director"
                icon={<Briefcase className="w-4 h-4" />}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address (Read-only)
                </label>
                <div className="px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-sm font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user?.email}
                </div>
              </div>
              <Input
                label="Phone / Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 713 555 0192"
                icon={<Phone className="w-4 h-4" />}
              />
            </div>

            {/* Profile Picture Selection Section */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Profile Picture & Avatar
              </label>

              {/* Mode Tabs */}
              <div className="flex gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setAvatarInputMode('preset')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    avatarInputMode === 'preset'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Presets
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarInputMode('upload')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    avatarInputMode === 'upload'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarInputMode('url')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    avatarInputMode === 'url'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Image URL
                </button>
              </div>

              {/* Preset Chooser */}
              {avatarInputMode === 'preset' && (
                <div className="grid grid-cols-6 gap-3 pt-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        avatarUrl === url ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-14 object-cover rounded-lg" />
                      {avatarUrl === url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Upload Input */}
              {avatarInputMode === 'upload' && (
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-slate-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="avatar-file-input"
                    className="hidden"
                  />
                  <label htmlFor="avatar-file-input" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 bg-slate-800 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">Click to select image file from computer</p>
                    <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP (Max 2MB)</p>
                  </label>
                </div>
              )}

              {/* Image URL Input */}
              {avatarInputMode === 'url' && (
                <Input
                  label="Direct Image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/my-profile-pic.jpg"
                  icon={<LinkIcon className="w-4 h-4" />}
                />
              )}
            </div>

            {/* Bio / Specialty */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Bio & Technical Specialty
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your export region expertise, technical standards knowledge, or B2B outreach role..."
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button type="submit" isLoading={loading} className="px-6 py-2.5 text-sm font-semibold">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
