"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download, 
  Clock,
  User,
  FileText,
  Camera,
  Home,
  Loader2,
  Search,
  Filter
} from 'lucide-react';

interface KYCSubmission {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  createdAt: string;
  kycDocuments: {
    id: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    status: string;
    uploadedAt: string;
    verifiedAt: string | null;
    rejectionReason: string | null;
    notes: string | null;
    s3Key: string | null;
  }[];
}

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

function DocumentViewer({ isOpen, onClose, document }: DocumentViewerProps) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {document.fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {document.documentType === 'ID_PROOF' ? 'Government ID' :
                 document.documentType === 'ADDRESS_PROOF' ? 'Proof of Address' :
                 document.documentType === 'SELFIE_PHOTO' ? 'Selfie' : document.documentType}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {(document.fileSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                document.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                document.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {document.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {document.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Rejection Reason:</h4>
              <p className="text-red-800 dark:text-red-200">{document.rejectionReason}</p>
            </div>
          )}

          {document.notes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Admin Notes:</h4>
              <p className="text-blue-800 dark:text-blue-200">{document.notes}</p>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Document Preview:</h4>
            {document.fileName?.toLowerCase().includes('.pdf') ? (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">PDF Document</p>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </div>
            ) : (
              <img
                src={document.fileUrl}
                alt={document.fileName}
                className="w-full rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.style.display = 'block';
                }}
              />
              <div className="hidden bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Image not available</p>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminKYCPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      await fetchSubmissions();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/admin/login');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/kyc', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        alert('Access denied. Admin privileges required.');
        router.push('/admin');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      } else {
        console.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: string, reason?: string, notes?: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/kyc/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, reason, notes })
      });

      if (response.ok) {
        await fetchSubmissions();
        alert(`KYC ${action.toLowerCase()}d successfully`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Error processing action');
    } finally {
      setActionLoading(null);
    }
  };

  const viewDocument = (document: any) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'ID_PROOF':
        return <FileText className="h-5 w-5" />;
      case 'ADDRESS_PROOF':
        return <Home className="h-5 w-5" />;
      case 'SELFIE_PHOTO':
        return <Camera className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || submission.kycStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading KYC submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            KYC Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage KYC document submissions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No KYC submissions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No KYC submissions have been made yet'
                }
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {/* User Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {submission.firstName} {submission.lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{submission.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.kycStatus)}`}>
                      {submission.kycStatus}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Documents:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {submission.kycDocuments.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getDocumentIcon(doc.documentType)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.documentType === 'ID_PROOF' ? 'Government ID' :
                               doc.documentType === 'ADDRESS_PROOF' ? 'Proof of Address' :
                               doc.documentType === 'SELFIE_PHOTO' ? 'Selfie' : doc.documentType}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {doc.fileName}
                        </p>
                        <button
                          onClick={() => viewDocument(doc)}
                          className="w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center justify-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {submission.kycStatus === 'PENDING' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAction(submission.id, 'APPROVE')}
                      disabled={actionLoading === submission.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {actionLoading === submission.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          handleAction(submission.id, 'REJECT', reason);
                        }
                      }}
                      disabled={actionLoading === submission.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {actionLoading === submission.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Enter additional information request:');
                        if (notes) {
                          handleAction(submission.id, 'REQUEST_MORE_INFO', undefined, notes);
                        }
                      }}
                      disabled={actionLoading === submission.id}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {actionLoading === submission.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      Request More Info
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <DocumentViewer
        isOpen={showDocumentViewer}
        onClose={() => setShowDocumentViewer(false)}
        document={selectedDocument}
      />
    </div>
  );
} 