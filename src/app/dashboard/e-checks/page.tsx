'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  User,
  Building,
  X,
  Loader2,
} from 'lucide-react';
import DashboardPageShell from '@/components/layout/DashboardPageShell';

interface ECheck {
  id: string;
  checkNumber: string;
  accountNumber: string;
  payeeName: string;
  amount: string;
  memo: string;
  status: string;
  createdAt: string;
  clearedAt: string | null;
}

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  currency: string;
}

export default function EChecksPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<ECheck[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    accountId: '',
    payeeName: '',
    amount: '',
    memo: '',
  });
  const [showSelfie, setShowSelfie] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [checksResult, accountsResult] = await Promise.allSettled([
        fetch('/api/e-checks', { headers }),
        fetch('/api/user/accounts', { headers }),
      ]);

      if (checksResult.status === 'fulfilled' && checksResult.value.ok) {
        const checksData = await checksResult.value.json();
        setChecks(checksData.checks || []);
      } else if (checksResult.status === 'rejected') {
        console.error('Error fetching e-checks:', checksResult.reason);
      }

      if (accountsResult.status === 'fulfilled' && accountsResult.value.ok) {
        const accountsData = await accountsResult.value.json();
        setAccounts(accountsData.accounts || []);
        if (accountsData.accounts?.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: accountsData.accounts[0].id }));
        }
      } else if (accountsResult.status === 'rejected') {
        console.error('Error fetching accounts:', accountsResult.reason);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToastMessage('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const captureSelfie = () => {
    setShowSelfie(true);
  };

  const takePhoto = () => {
    const video = document.getElementById('video') as HTMLVideoElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (video && canvas && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          setCapturedImage(canvas.toDataURL('image/jpeg'));
        }
      }, 'image/jpeg');
    }
    setShowSelfie(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('video') as HTMLVideoElement;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const handleCreateCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId || !formData.payeeName || !formData.amount) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    if (!capturedImage) {
      showToastMessage('Please take a selfie for verification', 'error');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/e-checks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: formData.accountId,
          payeeName: formData.payeeName,
          amount: formData.amount,
          memo: formData.memo,
          selfieImage: capturedImage,
        }),
      });

      if (response.ok) {
        showToastMessage('E-Check created successfully! Pending admin approval.', 'success');
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        showToastMessage(error.error || 'Failed to create E-Check', 'error');
      }
    } catch (error) {
      console.error('Error creating E-Check:', error);
      showToastMessage('Error creating E-Check', 'error');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountId: accounts[0]?.id || '',
      payeeName: '',
      amount: '',
      memo: '',
    });
    setCapturedImage(null);
    setShowSelfie(false);
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'dashboard-badge dashboard-badge-warning';
      case 'APPROVED':
        return 'dashboard-badge dashboard-badge-info';
      case 'PROCESSED':
        return 'dashboard-badge dashboard-badge-success';
      case 'CLEARED':
        return 'dashboard-badge dashboard-badge-info';
      case 'REJECTED':
        return 'dashboard-badge dashboard-badge-danger';
      default:
        return 'dashboard-badge dashboard-badge-default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
      case 'PROCESSED':
      case 'CLEARED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <DashboardPageShell
      activeTab="e-checks"
      title="E-Checks"
      subtitle="Create and manage your electronic checks"
      headerExtra={
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary dashboard-header-btn"
        >
          <Plus className="h-4 w-4" />
          Create E-Check
        </button>
      }
    >
      {loading ? (
        <div className="dashboard-card">
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading e-checks...</p>
          </div>
        </div>
      ) : checks.length === 0 ? (
        <div className="dashboard-card dashboard-empty-state">
          <div className="dashboard-empty-icon">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="dashboard-empty-title">No E-Checks Yet</h3>
          <p className="dashboard-empty-text">
            Create your first electronic check to start making payments
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Your First E-Check
          </button>
        </div>
      ) : (
        <div className="dashboard-card-grid">
          {checks.map((check) => (
            <div key={check.id} className="dashboard-card dashboard-card-item">
              <div className="dashboard-card-item-header">
                <div className="dashboard-card-item-icon">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="dashboard-card-item-meta">
                  <h3 className="dashboard-card-item-title">#{check.checkNumber}</h3>
                  <span className={getStatusClass(check.status)}>
                    {getStatusIcon(check.status)}
                    <span>{check.status.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>

              <div className="dashboard-fd-amount">{formatCurrency(check.amount)}</div>
              <p className="dashboard-detail-label">Check Amount</p>

              <div className="dashboard-fd-dates">
                <div className="dashboard-fd-date-row">
                  <span className="dashboard-detail-label">Payable to</span>
                  <span className="dashboard-detail-value">{check.payeeName}</span>
                </div>
                <div className="dashboard-fd-date-row">
                  <span className="dashboard-detail-label">Account</span>
                  <span className="dashboard-detail-value">{check.accountNumber}</span>
                </div>
                <div className="dashboard-fd-date-row">
                  <span className="dashboard-detail-label">Type</span>
                  <span className="dashboard-detail-value">Account Only</span>
                </div>
                <div className="dashboard-fd-date-row">
                  <span className="dashboard-detail-label">Created</span>
                  <span className="dashboard-detail-value">{formatDate(check.createdAt)}</span>
                </div>
                {check.clearedAt && (
                  <div className="dashboard-fd-date-row">
                    <span className="dashboard-detail-label">Cleared</span>
                    <span className="dashboard-detail-value dashboard-fd-matured">
                      {formatDate(check.clearedAt)}
                    </span>
                  </div>
                )}
              </div>

              {check.memo && (
                <div className="dashboard-echeck-memo">
                  <p>{check.memo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-backdrop" onClick={() => !creating && setShowCreateModal(false)} />
          <div className="dashboard-modal dashboard-echeck-modal">
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Create E-Check</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="dashboard-icon-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCheck} className="dashboard-form">
              <div className="dashboard-form-group">
                <label className="dashboard-label">From Account</label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountId: e.target.value }))}
                  className="dashboard-input"
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.accountType} ($
                      {parseFloat(account.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Payable To</label>
                <input
                  type="text"
                  value={formData.payeeName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, payeeName: e.target.value }))}
                  placeholder="Enter payee name"
                  className="dashboard-input"
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="dashboard-input"
                  required
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Check Type</label>
                <div className="dashboard-echeck-type-grid">
                  {[
                    { type: 'ACCOUNT_ONLY', label: 'Account Only', icon: User },
                    { type: 'CASHIERS', label: "Cashier's", icon: Building },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      disabled
                      className="dashboard-echeck-type-btn disabled"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <p className="dashboard-echeck-type-note">
                  Currently only Account Only checks are supported
                </p>
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Memo (Optional)</label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
                  placeholder="What's this check for?"
                  className="dashboard-input"
                />
              </div>

              <div className="dashboard-form-group">
                <label className="dashboard-label">Selfie Verification</label>
                {!capturedImage ? (
                  <div className="dashboard-upload-zone">
                    <Camera className="h-10 w-10 dashboard-upload-icon" />
                    <p>Take a selfie to verify your identity</p>
                    <button type="button" onClick={captureSelfie} className="btn-primary">
                      <Camera className="h-4 w-4" />
                      Take Selfie
                    </button>
                  </div>
                ) : (
                  <div className="dashboard-echeck-selfie-preview">
                    <img src={capturedImage} alt="Captured selfie" />
                    <button type="button" onClick={captureSelfie} className="btn-secondary">
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={creating || !capturedImage}
                className="btn-primary dashboard-form-submit"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Create E-Check
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSelfie && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-backdrop" onClick={() => setShowSelfie(false)} />
          <div className="dashboard-modal dashboard-echeck-modal">
            <h3 className="dashboard-modal-title">Take Selfie</h3>
            <video id="video" className="dashboard-echeck-video" autoPlay playsInline />
            <div className="dashboard-form-actions">
              <button type="button" onClick={startCamera} className="btn-secondary">
                Start Camera
              </button>
              <button type="button" onClick={takePhoto} className="btn-primary">
                Take Photo
              </button>
            </div>
            <canvas id="canvas" className="hidden" />
          </div>
        </div>
      )}

      {showToast && (
        <div
          className={`dashboard-toast ${
            toastType === 'success' ? 'dashboard-toast-success' : 'dashboard-toast-error'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </DashboardPageShell>
  );
}
