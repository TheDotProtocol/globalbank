'use client';

import { useState, useEffect } from 'react';
import { 
  User, Shield, Lock, CheckCircle, XCircle,
  AlertCircle, FileText, Save,
  Mail, Phone
} from 'lucide-react';
import DashboardPageShell from '@/components/layout/DashboardPageShell';
import KYCUploadForm from '@/components/KYCUploadForm';
import KYCDocumentsDisplay from '@/components/KYCDocumentsDisplay';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  kycStatus: string;
  twoFactorEnabled: boolean;
  accounts: Array<{
    id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
    isActive: boolean;
  }>;
}

export default function ProfilePage() {
  const [profileTab, setProfileTab] = useState('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: '',
    password: ''
  });

  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfileForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || ''
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, ...data.user } : null);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setSecurityForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          newEmail: emailChangeForm.newEmail,
          password: emailChangeForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setEmailChangeForm({ newEmail: '', password: '' });
        setShowEmailChange(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to request email change' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request email change' });
    } finally {
      setEmailChangeLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardPageShell activeTab="profile" title="Profile Settings" subtitle="Loading...">
        <div className="dashboard-card">
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading profile...</p>
          </div>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      activeTab="profile"
      title="Profile Settings"
      subtitle="Manage your account information and security settings"
    >
      {message && (
        <div className={`dashboard-alert ${
          message.type === 'success' ? 'dashboard-alert-success' : 'dashboard-alert-error'
        }`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-tabs">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'kyc', label: 'KYC Verification', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setProfileTab(tab.id)}
            className={`dashboard-tab ${profileTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-card">
            {profileTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="firstName"
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="lastName"
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed directly</p>
                      <button
                        type="button"
                        onClick={() => setShowEmailChange(!showEmailChange)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {showEmailChange ? 'Cancel' : 'Change Email'}
                      </button>
                    </div>
                  </div>

                  {showEmailChange && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                        Change Email Address
                      </h3>
                      <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Email Address
                          </label>
                          <input
                            id="newEmail"
                            type="email"
                            value={emailChangeForm.newEmail}
                            onChange={(e) => setEmailChangeForm(prev => ({ ...prev, newEmail: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter new email address"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Current Password
                          </label>
                          <input
                            id="emailPassword"
                            type="password"
                            value={emailChangeForm.password}
                            onChange={(e) => setEmailChangeForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="Enter your current password"
                            required
                          />
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="text-xs text-yellow-800 dark:text-yellow-200">
                              <p className="font-medium">Important:</p>
                              <p>You'll receive a verification email at the new address. Click the link to complete the change.</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={emailChangeLoading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {emailChangeLoading ? 'Sending...' : 'Request Email Change'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowEmailChange(false);
                              setEmailChangeForm({ newEmail: '', password: '' });
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary dashboard-form-submit"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {profileTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="currentPassword"
                        type="password"
                        value={securityForm.currentPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        type="password"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary dashboard-form-submit"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {profileTab === 'kyc' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">KYC Verification</h2>
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      user?.kycStatus === 'APPROVED' 
                        ? 'bg-green-100 dark:bg-green-900/50' 
                        : user?.kycStatus === 'PENDING'
                        ? 'bg-yellow-100 dark:bg-yellow-900/50'
                        : 'bg-red-100 dark:bg-red-900/50'
                    }`}>
                      {user?.kycStatus === 'APPROVED' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : user?.kycStatus === 'PENDING' ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Status: {user?.kycStatus}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user?.kycStatus === 'APPROVED' 
                          ? 'Your identity has been verified successfully'
                          : user?.kycStatus === 'PENDING'
                          ? 'Your documents are under review'
                          : 'Please complete your KYC verification'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* KYC Documents Display */}
                <KYCDocumentsDisplay userId={user?.id} />

                {user?.kycStatus !== 'APPROVED' && (
                  <KYCUploadForm />
                )}
              </div>
            )}
          </div>
    </DashboardPageShell>
  );
} 