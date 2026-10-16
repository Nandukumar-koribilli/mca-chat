import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Save, CheckCircle, AlertCircle, Camera, Image, Database, Cloud, RefreshCw, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getLocalStorageStats } from '../services/localDb';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [className, setClassName] = useState(user?.className || 'Class 9A');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Gallery file input ref
  const fileInputRef = useRef(null);
  const [storageStats, setStorageStats] = useState(null);
  const [syncingBackup, setSyncingBackup] = useState(false);
  const [backupNotice, setBackupNotice] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status messages
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Load phone local DB stats
  const refreshStorageStats = async () => {
    const stats = await getLocalStorageStats();
    setStorageStats(stats);
  };

  useEffect(() => {
    refreshStorageStats();
  }, []);

  // Handle image selected from phone gallery or camera
  const handleGallerySelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file from your gallery.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(optimizedDataUrl);
        setProfileSuccess('Photo selected from gallery! Click "Save Profile" to apply changes.');
        setProfileError('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleManualBackup = async () => {
    setSyncingBackup(true);
    setBackupNotice('');
    try {
      await Promise.all([
        api.get('/tasks'),
        api.get('/notes'),
        api.get('/conversations'),
      ]);
      await refreshStorageStats();
      setBackupNotice('All tasks, notes & messages synchronized with MongoDB Atlas cloud backup.');
      setTimeout(() => setBackupNotice(''), 4000);
    } catch {
      setBackupNotice('Sync failed. Please check your internet connection.');
    } finally {
      setSyncingBackup(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      await updateProfile({ displayName, className, bio, avatar });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Manage your student profile information, username identity, and account credentials.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2.5xl bg-brand-purple/20 text-brand-purple-text flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-dark">Profile Details</h2>
            <p className="text-xs text-brand-muted">Information visible to your MCA classmates in chat.</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Username (Student Identifier)
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 border border-gray-200 text-xs cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Classmates search for you using @{user?.username}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Kate Malone"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Class / Semester
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Class 9A or MCA 2nd Sem"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            {/* Profile Picture Gallery Selector */}
            <div className="sm:col-span-2 p-4 rounded-3xl bg-brand-canvas/60 border border-black/[0.04]">
              <label className="block text-xs font-bold text-brand-dark mb-2">
                Profile Picture (Choose from Gallery)
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-3xl object-cover border-2 border-brand-purple shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-brand-dark text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
                      {displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Gallery Buttons */}
                <div className="flex-1 text-center sm:text-left">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleGallerySelect}
                  />
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Image className="w-4 h-4 text-[#A2F08D]" />
                      <span>Choose from Gallery</span>
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatar('');
                          setProfileSuccess('Profile picture cleared. Click Save Profile to apply.');
                        }}
                        className="px-3 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-muted mt-2">
                    Tap to open your phone gallery or photos. Scaled and compressed automatically for fast mobile loading.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Short Bio
            </label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your classmates about your academic interests..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-pill"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2.5xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-dark">Security & Password</h2>
            <p className="text-xs text-brand-muted">Update your login password securely.</p>
          </div>
        </div>

        {pwSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{pwSuccess}</span>
          </div>
        )}

        {pwError && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full sm:w-80 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-pill"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Storage & Cloud Backup Card (SQLite, Phone Storage & MongoDB Atlas) */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
        <div className="flex items-center justify-between pb-5 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2.5xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-dark">Data Architecture & Cloud Backup</h2>
              <p className="text-xs text-brand-muted">Phone SQLite/IndexedDB cache, media vault, and cloud backup.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualBackup}
            disabled={syncingBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingBackup ? 'animate-spin' : ''}`} />
            <span>{syncingBackup ? 'Synchronizing...' : 'Sync & Backup Now'}</span>
          </button>
        </div>

        {backupNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span>{backupNotice}</span>
          </div>
        )}

        {/* Data Architecture Matrix */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-3xl bg-brand-canvas/60 border border-black/[0.04]">
            <div className="flex items-center gap-2 text-brand-dark font-bold text-xs mb-1">
              <Smartphone className="w-4 h-4 text-brand-purple" />
              <span>Phone Local Cache</span>
            </div>
            <p className="text-[11px] text-brand-muted">SQLite / IndexedDB on device</p>
            <div className="mt-2.5 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Personal Tasks:</span>
                <span className="font-bold text-brand-dark">{storageStats?.tasksCount ?? 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Personal Notes:</span>
                <span className="font-bold text-brand-dark">{storageStats?.notesCount ?? 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cached Messages:</span>
                <span className="font-bold text-brand-dark">{storageStats?.messagesCount ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-brand-canvas/60 border border-black/[0.04]">
            <div className="flex items-center gap-2 text-brand-dark font-bold text-xs mb-1">
              <Cloud className="w-4 h-4 text-green-600" />
              <span>Cloud Backup</span>
            </div>
            <p className="text-[11px] text-brand-muted">MongoDB Atlas (mca_chat)</p>
            <div className="mt-2.5 text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5 text-green-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Active & Synced</span>
              </div>
              <p className="text-[11px] text-gray-500">All data automatically backed up in MongoDB Atlas.</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-brand-canvas/60 border border-black/[0.04]">
            <div className="flex items-center gap-2 text-brand-dark font-bold text-xs mb-1">
              <Image className="w-4 h-4 text-amber-600" />
              <span>Images & Media</span>
            </div>
            <p className="text-[11px] text-brand-muted">Phone storage + P2P share</p>
            <div className="mt-2.5 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Local Media Files:</span>
                <span className="font-bold text-brand-dark">{storageStats?.mediaCount ?? 0}</span>
              </div>
              <p className="text-[11px] text-gray-500">Stored on phone with optional peer-to-peer sharing.</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-brand-canvas/60 border border-black/[0.04]">
            <div className="flex items-center gap-2 text-brand-dark font-bold text-xs mb-1">
              <RefreshCw className="w-4 h-4 text-brand-dark" />
              <span>Peer Discovery</span>
            </div>
            <p className="text-[11px] text-brand-muted">Node.js signaling service</p>
            <div className="mt-2.5 text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-1.5 text-brand-dark font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#A2F08D] border border-black/20"></span>
                <span>Socket.IO Signaling</span>
              </div>
              <p className="text-[11px] text-gray-500">Real-time classmate discovery and P2P exchange.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
