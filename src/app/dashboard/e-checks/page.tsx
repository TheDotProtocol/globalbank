"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Download, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  User,
  Building,
  X,
  Loader2
} from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checks, setChecks] = useState<ECheck[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [mounted, setMounted] = useState(false);

  // Create check form state
  const [formData, setFormData] = useState({
    accountId: '',
    payeeName: '',
    amount: '',
    memo: ''
  });
  const [showSelfie, setShowSelfie] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch checks
      const checksResponse = await fetch('/api/e-checks', { headers });
      if (checksResponse.ok) {
        const checksData = await checksResponse.json();
        setChecks(checksData.checks || []);
      }

      // Fetch accounts
      const accountsResponse = await fetch('/api/user/accounts', { headers });
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData.accounts || []);
        if (accountsData.accounts?.length > 0) {
          setFormData(prev => ({ ...prev, accountId: accountsData.accounts[0].id }));
        }
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
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: formData.accountId,
          payeeName: formData.payeeName,
          amount: formData.amount,
          memo: formData.memo,
          selfieImage: capturedImage
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToastMessage('E-Check created successfully! Pending admin approval.', 'success');
        setShowCreateModal(false);
        resetForm();
        fetchData(); // Refresh the list
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
      memo: ''
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
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'APPROVED':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'PROCESSED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'CLEARED':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'REJECTED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PROCESSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CLEARED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="lg:ml-64 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab="e-checks" />
        <div className="lg:ml-64 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab="e-checks" />
      
      <div className="lg:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            E-Checks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your electronic checks
          </p>
        </div>

        {/* Create New Check Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New E-Check
          </button>
        </div>

        {/* E-Checks Grid */}
        {checks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No E-Checks Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first electronic check to start making payments
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First E-Check
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {checks.map((check) => (
              <div
                key={check.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      #{check.checkNumber}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                    {getStatusIcon(check.status)}
                    <span className="ml-1">{check.status.replace('_', ' ')}</span>
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(check.amount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Check Amount
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Payable to:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {check.payeeName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Account:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {check.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Account Only
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(check.createdAt)}
                    </span>
                  </div>
                  {check.clearedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Cleared:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatDate(check.clearedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {check.memo && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {check.memo}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Check Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create E-Check
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCheck} className="p-6 space-y-6">
              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Account
                </label>
                <select
                  value={formData.accountId}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.accountType} (${parseFloat(account.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payable To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payable To
                </label>
                <input
                  type="text"
                  value={formData.payeeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, payeeName: e.target.value }))}
                  placeholder="Enter payee name"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Check Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'ACCOUNT_ONLY', label: 'Account Only', icon: User },
                    { type: 'CASHIERS', label: 'Cashier\'s', icon: Building }
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      disabled
                      className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Currently only Account Only checks are supported
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  value={formData.memo}
                  onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                  placeholder="What's this check for?"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Selfie Verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selfie Verification
                </label>
                {!capturedImage ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Take a selfie to verify your identity
                    </p>
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Take Selfie
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={capturedImage}
                      alt="Captured selfie"
                      className="w-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating || !capturedImage}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Create E-Check</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Selfie Camera Modal */}
      {showSelfie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Take Selfie
              </h3>
              <video
                id="video"
                className="w-full rounded-lg mb-4"
                autoPlay
                playsInline
              />
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Start Camera
                </button>
                <button
                  onClick={takePhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Take Photo
                </button>
              </div>
              <canvas id="canvas" className="hidden" />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toastType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
} 