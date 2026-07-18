'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import DashboardPageShell from '@/components/layout/DashboardPageShell';
import TranslationPrompt from '@/components/TranslationPrompt';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kycStatus: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const userData = await response.json();
      setUser(userData.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showToast('Error loading user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getKycBadgeClass = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'dashboard-badge dashboard-badge-success';
      case 'PENDING':
        return 'dashboard-badge dashboard-badge-warning';
      default:
        return 'dashboard-badge dashboard-badge-danger';
    }
  };

  if (loading) {
    return (
      <DashboardPageShell activeTab="settings" title="Settings" subtitle="Loading...">
        <div className="dashboard-card">
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading settings...</p>
          </div>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <>
      <TranslationPrompt />
      <DashboardPageShell
        activeTab="settings"
        title="Settings"
        subtitle="Manage your account preferences and security settings"
      >
        <div className="dashboard-settings-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-section-header">
              <div className="dashboard-card-section-icon">
                <User className="h-6 w-6" />
              </div>
              <h2 className="dashboard-card-title">Account Settings</h2>
            </div>
            <div className="dashboard-form">
              <div className="dashboard-form-group">
                <label className="dashboard-label">Full Name</label>
                <input
                  type="text"
                  value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  className="dashboard-input"
                  readOnly
                />
              </div>
              <div className="dashboard-form-group">
                <label className="dashboard-label">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="dashboard-input"
                  readOnly
                />
              </div>
              <div className="dashboard-form-group">
                <label className="dashboard-label">KYC Status</label>
                <span className={getKycBadgeClass(user?.kycStatus)}>
                  {user?.kycStatus || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-section-header">
              <div className="dashboard-card-section-icon dashboard-icon-green">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="dashboard-card-title">Security</h2>
            </div>
            <div className="dashboard-settings-actions">
              <button className="btn-primary">Change Password</button>
              <button className="btn-secondary">Enable 2FA</button>
              <button className="btn-secondary">Security Log</button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-section-header">
              <div className="dashboard-card-section-icon dashboard-icon-purple">
                <Bell className="h-6 w-6" />
              </div>
              <h2 className="dashboard-card-title">Notifications</h2>
            </div>
            <div className="dashboard-toggle-list">
              <label className="dashboard-toggle-row">
                <span>Email Notifications</span>
                <input type="checkbox" defaultChecked />
              </label>
              <label className="dashboard-toggle-row">
                <span>SMS Notifications</span>
                <input type="checkbox" />
              </label>
              <label className="dashboard-toggle-row">
                <span>Transaction Alerts</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-section-header">
              <div className="dashboard-card-section-icon dashboard-icon-red">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="dashboard-card-title">Privacy</h2>
            </div>
            <div className="dashboard-settings-actions">
              <button className="btn-secondary">Download My Data</button>
              <button className="btn-secondary dashboard-btn-danger">Delete Account</button>
            </div>
          </div>
        </div>

        <div className="dashboard-form-actions dashboard-form-actions-end">
          <button className="btn-primary">
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>
      </DashboardPageShell>
    </>
  );
}
