import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';

import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Save,
  Camera,
  Upload,
  Sparkles,
  Briefcase,
  MapPin,
  Utensils,
  KeyRound,
  Eye,
  EyeOff,
  Crown,
  Edit3,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    id: 'groom',
    label: 'Royal Groom / Safa',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    category: 'Traditional',
  },
  {
    id: 'bride',
    label: 'Bridal Elegance',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    category: 'Traditional',
  },
  {
    id: 'organizer',
    label: 'Event Maestro',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    category: 'Professional',
  },
  {
    id: 'executive',
    label: 'Celebration Host',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    category: 'Host',
  },
  {
    id: 'diya',
    label: 'Sacred Diya Aura',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
    category: 'Motif',
  },
  {
    id: 'floral',
    label: 'Royal Marigold Bloom',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    category: 'Floral',
  },
  {
    id: 'fort',
    label: 'Heritage Palace',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80',
    category: 'Heritage',
  },
  {
    id: 'admin',
    label: 'Executive Crest',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    category: 'Executive',
  },
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isAdmin, isOrganizer } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'overview' | 'edit' | 'security' | 'business'
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security' | 'business'>('overview');

  // Profile Basic State
  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Jaipur');
  const [stateName, setStateName] = useState(user?.state || 'Rajasthan');
  const [dietaryPreference, setDietaryPreference] = useState<'Veg' | 'Non-Veg' | 'Jain' | 'Vegan' | 'All'>(
    (user?.dietaryPreference as any) || 'Veg'
  );
  const [culturalTradition, setCulturalTradition] = useState(
    user?.preferences?.culturalPreference || 'Rajasthani'
  );

  // Organizer Specific State
  const [organizationName, setOrganizationName] = useState(user?.organizationName || '');
  const [organizationDescription, setOrganizationDescription] = useState(
    user?.organizationDescription || ''
  );
  const [businessCategory, setBusinessCategory] = useState(
    user?.businessCategory || 'Full Event Management'
  );
  const [experience, setExperience] = useState(user?.experience || '5+ Years');

  // Profile Photo State
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // File Upload Handler (Base64 Reader for instant local/database persistence)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhoto(reader.result);
        setShowPhotoModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setProfilePhoto(customUrlInput.trim());
    setCustomUrlInput('');
    setShowPhotoModal(false);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSavedSuccess(false);

    setIsSaving(true);
    try {
      const payload: any = {
        name,
        fullName: name,
        phone,
        city,
        state: stateName,
        profilePhoto,
        profileImage: profilePhoto,
        dietaryPreference,
        preferences: {
          ...user?.preferences,
          foodPreference: dietaryPreference,
          culturalPreference: culturalTradition,
        },
      };

      if (isOrganizer) {
        payload.organizationName = organizationName;
        payload.organizationDescription = organizationDescription;
        payload.businessCategory = businessCategory;
        payload.experience = experience;
      }

      await updateUser(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setErrorMessage('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put<{ success: boolean; message?: string }>('/auth/profile', {
        currentPassword,
        newPassword,
      });
      if (!res.success) {
        throw new Error(res.message || 'Failed to change password.');
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20">
          <MandalaCorner className="w-32 h-32" />
        </div>

        {/* Profile Avatar & Identity Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-utsav-gold/30">
          {/* Avatar with Photo Picker */}
          <div className="relative group cursor-pointer" onClick={() => setShowPhotoModal(true)}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-utsav-gold shadow-xl relative bg-utsav-maroon-950">
              <img
                src={profilePhoto}
                alt={user?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                <Camera className="w-6 h-6 text-utsav-gold animate-pulse" />
                <span className="text-[10px] font-bold text-utsav-gold mt-1">Change</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoModal(true);
              }}
              className="absolute bottom-1 right-1 p-2 rounded-full gold-gradient-btn shadow-lg border-2 border-utsav-maroon-900 text-utsav-brown-950 hover:scale-110 transition-transform cursor-pointer"
              title="Upload custom photo or pick avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details & Role Badge */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-utsav-maroon-900 dark:text-utsav-gold">
                  {name || user?.name}
                </h2>
                {isAdmin && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-red-900 via-utsav-maroon-900 to-black text-amber-300 border border-amber-400 shadow w-fit mx-auto sm:mx-0">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Administrator</span>
                  </span>
                )}
                {isOrganizer && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-utsav-saffron text-utsav-maroon-950 shadow w-fit mx-auto sm:mx-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Certified Event Organizer</span>
                  </span>
                )}
                {!isAdmin && !isOrganizer && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-utsav-maroon-800 text-utsav-gold shadow w-fit mx-auto sm:mx-0">
                    <DiyaIcon className="w-3.5 h-3.5" />
                    <span>Celebration Host</span>
                  </span>
                )}
              </div>

              {/* Action Button to Toggle Edit */}
              {activeTab === 'overview' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md hover:scale-105 transition-transform self-center sm:self-auto cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-utsav-brown dark:text-utsav-gold text-xs font-bold hover:border-utsav-gold shadow-sm transition-colors self-center sm:self-auto cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View Overview</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-utsav-gold" />
                <span>{user?.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-utsav-gold" />
                <span>{phone || 'No phone set'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-utsav-gold" />
                <span>{city}, {stateName}</span>
              </span>
            </div>

            <p className="text-[11px] text-utsav-brown-600 dark:text-utsav-ivory/70 pt-1">
              Manage your personal credentials, contact coordinates, Indian cultural preferences, and account security.
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-2 pt-4 overflow-x-auto scrollbar-none border-b border-utsav-gold/20 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-md'
                : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
            }`}
          >
            <User className="w-3.5 h-3.5 text-utsav-gold" />
            <span>Profile Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'edit'
                ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-md'
                : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-utsav-gold" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-md'
                : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-utsav-gold" />
            <span>Security & Password</span>
          </button>

          {isOrganizer && (
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'business'
                  ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-md'
                  : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Agency & Studio</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('business')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'business'
                  ? 'bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold shadow-md'
                  : 'bg-white dark:bg-utsav-maroon-950 text-gray-600 dark:text-gray-300 border border-utsav-gold/20 hover:border-utsav-gold'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-utsav-gold" />
              <span>Admin Governance</span>
            </button>
          )}
        </div>

        {/* Global Feedback Alerts */}
        {savedSuccess && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Your profile and cultural preferences have been updated successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-500 text-red-800 dark:text-red-300 font-bold text-xs animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PROFILE OVERVIEW (READ-ONLY VIEW WITH EDIT CTA)                    */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Details Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
                  <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                    <User className="w-4 h-4 text-utsav-gold" />
                    <span>Identity & Coordinates</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="text-utsav-gold hover:underline text-[11px] font-bold"
                  >
                    Edit →
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Full Name:</span>
                    <span className="font-bold text-utsav-brown dark:text-utsav-ivory">{name || user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Primary Email:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone Contact:</span>
                    <span className="font-bold text-utsav-brown dark:text-utsav-ivory">{phone || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Residence / Hub:</span>
                    <span className="font-bold text-utsav-brown dark:text-utsav-ivory">{city}, {stateName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                      ✓ Active Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Cultural & Culinary Preferences Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
                  <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-utsav-gold" />
                    <span>Cultural & Feast Preferences</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="text-utsav-gold hover:underline text-[11px] font-bold"
                  >
                    Edit →
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cultural Tradition:</span>
                    <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{culturalTradition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dietary Preference:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {dietaryPreference === 'Veg'
                        ? 'Pure Vegetarian (Desi Ghee)'
                        : dietaryPreference === 'Jain'
                        ? 'Jain Satvik (No Root Veg)'
                        : dietaryPreference === 'Vegan'
                        ? 'Plant-based Vegan'
                        : dietaryPreference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Digital Pass QR:</span>
                    <span className="text-utsav-gold font-bold">Enabled for all RSVPs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">AI Cultural Assistant:</span>
                    <span className="text-emerald-600 font-bold">Connected (Grok AI)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Specific Highlight Card */}
            {isOrganizer && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-utsav-maroon-950 via-utsav-maroon-900 to-utsav-maroon-950 border-2 border-utsav-gold text-utsav-ivory shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-utsav-gold" />
                    <h4 className="font-heading font-bold text-sm text-utsav-gold">
                      {organizationName || `${user?.name}'s Event Management`}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-300">
                    Category: <span className="font-semibold text-white">{businessCategory}</span> • Experience: <span className="font-semibold text-white">{experience}</span>
                  </p>
                  {organizationDescription && (
                    <p className="text-[11px] text-gray-400 max-w-xl italic line-clamp-2">
                      "{organizationDescription}"
                    </p>
                  )}
                </div>

                <Link
                  to="/organizer/dashboard"
                  className="px-4 py-2.5 rounded-xl gold-gradient-btn text-xs font-bold text-utsav-maroon-950 shadow-md whitespace-nowrap flex items-center space-x-1.5"
                >
                  <span>Open Organizer Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-utsav-maroon-900 to-black border-2 border-amber-400 text-utsav-ivory shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h4 className="font-heading font-bold text-sm text-amber-300">
                      Super Administrator Clearance
                    </h4>
                  </div>
                  <p className="text-xs text-gray-300">
                    Full platform governance permissions: Organizer Approvals, Live Gate Audit Logs, Escrow Settlements.
                  </p>
                </div>

                <Link
                  to="/admin"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-utsav-saffron to-amber-400 text-utsav-maroon-950 font-bold text-xs shadow-md whitespace-nowrap flex items-center space-x-1.5"
                >
                  <span>Admin Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="px-6 py-2.5 rounded-xl maroon-gradient-btn text-utsav-gold text-xs font-bold shadow-md flex items-center space-x-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile Information</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EDIT PROFILE FORM                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSubmitProfile} className="mt-6 space-y-6 animate-in fade-in duration-200">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
                <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-2">
                  <User className="w-4 h-4 text-utsav-gold" />
                  <span>Personal & Contact Information</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="text-xs font-bold text-utsav-gold hover:underline flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Full Name / Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jhenkar M S"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Primary Email (Readonly)
                  </label>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-utsav-maroon-950/80 border border-utsav-gold/20 text-xs sm:text-sm text-gray-500">
                    <span className="truncate">{user?.email}</span>
                    <div title="Verified Email" className="shrink-0 ml-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaipur / Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Cultural & Dining Preferences */}
            <div className="space-y-3 pt-4 border-t border-utsav-gold/20">
              <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-utsav-gold" />
                <span>Cultural & Feast Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Default Dietary Preference
                  </label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                  >
                    <option value="Veg">Pure Vegetarian</option>
                    <option value="Jain">Jain Satvik (No Onion/Garlic)</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="All">All Cuisines</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                    Primary Cultural Tradition
                  </label>
                  <select
                    value={culturalTradition}
                    onChange={(e) => setCulturalTradition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                  >
                    <option value="Rajasthani">Rajasthani / Marwari</option>
                    <option value="South Indian">South Indian (Tamil / Telugu / Kannada / Malayali)</option>
                    <option value="Punjabi">Punjabi / Sikh</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                    <option value="North Indian">North Indian Classic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Organizer Specific Information */}
            {isOrganizer && (
              <div className="space-y-3 pt-4 border-t border-utsav-gold/20">
                <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-utsav-gold" />
                  <span>Organizer & Agency Profile</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                      Agency / Business Name
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Royal Shubh Utsav Management"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                      Business Category & Specialty
                    </label>
                    <input
                      type="text"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      placeholder="e.g. Wedding Planner & Mandap Architect"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                      Agency Bio / Description
                    </label>
                    <textarea
                      rows={2}
                      value={organizationDescription}
                      onChange={(e) => setOrganizationDescription(e.target.value)}
                      placeholder="Describe your event management experience, specialized vendor networks, and signature themes..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs sm:text-sm text-utsav-brown dark:text-utsav-ivory focus:outline-none focus:border-utsav-gold shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-utsav-gold/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold text-utsav-brown dark:text-utsav-ivory hover:bg-utsav-beige-300 transition-colors cursor-pointer"
              >
                Cancel / Overview
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-2xl maroon-gradient-btn text-xs sm:text-sm font-bold shadow-xl flex items-center space-x-2 text-utsav-gold hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Profile Updates...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SECURITY & PASSWORD                                                */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
            {passwordSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Your password has been changed securely!</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="border-b border-utsav-gold/20 pb-2">
                <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-utsav-gold" />
                  <span>Update Account Password</span>
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-utsav-gold"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  New Password (Min 8 Chars) *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold shadow-md text-utsav-gold disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>

            {/* Security Status Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs">
              <div className="flex items-center space-x-2 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Protection Architecture</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-900 dark:text-emerald-200/80">
                <li>Bcrypt cryptographic salted password hashing.</li>
                <li>Encrypted JSON Web Token authentication sessions.</li>
                <li>Automatic rate limiting & lockout protection on 5 failed attempts.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AGENCY / ADMIN PORTAL ACCESS                                       */}
        {/* ========================================================================= */}
        {activeTab === 'business' && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
            {isOrganizer && (
              <div className="p-6 rounded-3xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
                  <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                    <Building className="w-5 h-5 text-utsav-gold" />
                    <span>Event Planner Studio Tools</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-utsav-saffron text-utsav-maroon-950 text-[10px] font-bold">
                    Organizer Tier
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Manage your coordinated celebrations, 2D Mandap architecture blueprints, VIP baithak seating charts, and gate QR entry verification.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Link
                    to="/organizer/dashboard"
                    className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/40 hover:border-utsav-gold transition-colors text-center space-y-1"
                  >
                    <span className="font-bold text-xs text-utsav-maroon-800 dark:text-utsav-gold block">
                      Organizer Dashboard
                    </span>
                    <span className="text-[10px] text-gray-500">Event rosters & status</span>
                  </Link>

                  <Link
                    to="/mandap-builder"
                    className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/40 hover:border-utsav-gold transition-colors text-center space-y-1"
                  >
                    <span className="font-bold text-xs text-utsav-maroon-800 dark:text-utsav-gold block">
                      2D Mandap Studio
                    </span>
                    <span className="text-[10px] text-gray-500">Hawan & arch builder</span>
                  </Link>

                  <Link
                    to="/scanner"
                    className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border border-utsav-gold/40 hover:border-utsav-gold transition-colors text-center space-y-1"
                  >
                    <span className="font-bold text-xs text-utsav-maroon-800 dark:text-utsav-gold block">
                      Gate QR Scanner
                    </span>
                    <span className="text-[10px] text-gray-500">Live guest arrival check-in</span>
                  </Link>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="p-6 rounded-3xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
                  <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span>Executive Platform Administration</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-900 text-amber-300 border border-amber-400 text-[10px] font-bold">
                    Admin Root
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Full system oversight over users, organizer verification queue, security audit trails, and Razorpay financial escrow reconciliations.
                </p>

                <div className="pt-2">
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl maroon-gradient-btn text-xs sm:text-sm font-bold text-amber-300 shadow-xl hover:scale-105 transition-transform"
                  >
                    <span>Launch Admin Command Center</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input for Device Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Custom Profile Photo Selection Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-utsav-ivory dark:bg-utsav-maroon-950 w-full max-w-xl rounded-3xl shadow-2xl border-2 border-utsav-gold/60 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-utsav-maroon-900 to-utsav-maroon-800 text-utsav-ivory border-b border-utsav-gold/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-utsav-gold" />
                <h3 className="font-heading text-sm font-bold text-utsav-gold">
                  Choose Custom Profile Picture
                </h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-utsav-ivory/70 hover:text-utsav-gold text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Option A: Upload from Device */}
              <div className="p-4 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 border-2 border-dashed border-utsav-gold/50 text-center space-y-2">
                <Upload className="w-8 h-8 mx-auto text-utsav-gold" />
                <div>
                  <h4 className="text-xs font-bold text-utsav-maroon-900 dark:text-utsav-gold">
                    Upload from your Computer or Phone
                  </h4>
                  <p className="text-[11px] text-gray-500">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold text-utsav-brown-950 shadow"
                >
                  Browse Device Files
                </button>
              </div>

              {/* Option B: Enter Custom Image URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase">
                  Or Paste Custom Image Web URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-utsav-maroon-900 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    disabled={!customUrlInput.trim()}
                    className="px-4 py-2.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold disabled:opacity-50"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Option C: Curated Indian Cultural & Professional Avatars */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase">
                  Or Choose from Curated Cultural Avatars
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        setProfilePhoto(avatar.url);
                        setShowPhotoModal(false);
                      }}
                      className={`p-2 rounded-2xl border text-center space-y-1.5 transition-all group ${
                        profilePhoto === avatar.url
                          ? 'border-utsav-gold bg-utsav-gold/10 ring-2 ring-utsav-gold'
                          : 'border-utsav-gold/30 hover:border-utsav-gold bg-white dark:bg-utsav-maroon-900'
                      }`}
                    >
                      <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-utsav-gold/60 shadow">
                        <img
                          src={avatar.url}
                          alt={avatar.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="block text-[10px] font-bold text-utsav-maroon-900 dark:text-utsav-ivory truncate">
                        {avatar.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
