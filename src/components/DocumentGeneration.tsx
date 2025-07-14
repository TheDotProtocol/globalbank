'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Document {
  id: string;
  type: 'statement' | 'certificate' | 'receipt' | 'kyc';
  title: string;
  description: string;
  date: string;
  status: 'available' | 'generating' | 'error';
  downloadUrl?: string;
}

export default function DocumentGeneration() {
  const [activeTab, setActiveTab] = useState('statements');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: 'statement',
      title: 'Account Statement - January 2024',
      description: 'Monthly account statement with all transactions',
      date: '2024-01-31',
      status: 'available',
      downloadUrl: '#'
    },
    {
      id: '2',
      type: 'certificate',
      title: 'Interest Certificate - Q4 2023',
      description: 'Certificate of interest earned on fixed deposits',
      date: '2023-12-31',
      status: 'available',
      downloadUrl: '#'
    },
    {
      id: '3',
      type: 'receipt',
      title: 'Transaction Receipt - #TX123456',
      description: 'Receipt for deposit transaction',
      date: '2024-01-15',
      status: 'available',
      downloadUrl: '#'
    }
  ]);

  const generateDocument = async (type: string) => {
    setIsGenerating(true);
    
    // Simulate document generation
    setTimeout(() => {
      const newDoc: Document = {
        id: Date.now().toString(),
        type: type as any,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`,
        description: `Generated ${type} document`,
        date: new Date().toISOString().split('T')[0],
        status: 'available',
        downloadUrl: '#'
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      setIsGenerating(false);
    }, 2000);
  };

  const downloadDocument = (doc: Document) => {
    // In a real app, this would trigger the actual download
    console.log('Downloading:', doc.title);
    // For now, we'll simulate the download
    const link = document.createElement('a');
    link.href = doc.downloadUrl || '#';
    link.download = `${doc.title}.pdf`;
    link.click();
  };

  const renderDocumentCard = (document: Document) => (
    <div key={document.id} className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            document.type === 'statement' ? 'bg-blue-100' :
            document.type === 'certificate' ? 'bg-green-100' :
            document.type === 'receipt' ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <FileText className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{document.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-gray-500">{document.date}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                document.status === 'available' ? 'bg-green-100 text-green-800' :
                document.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {document.status === 'available' ? 'Available' :
                 document.status === 'generating' ? 'Generating' : 'Error'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {document.status === 'available' && (
            <button
              onClick={() => downloadDocument(document)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Generation</h2>
          <p className="text-gray-600">Generate and download your banking documents</p>
        </div>
        <button
          onClick={() => generateDocument('statement')}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              <span>Generate New</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Account Statements</h3>
              <p className="text-sm text-gray-500">Monthly summaries</p>
            </div>
          </div>
          <button
            onClick={() => generateDocument('statement')}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Generate
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Interest Certificates</h3>
              <p className="text-sm text-gray-500">Fixed deposit earnings</p>
            </div>
          </div>
          <button
            onClick={() => generateDocument('certificate')}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            Generate
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Transaction Receipts</h3>
              <p className="text-sm text-gray-500">Payment confirmations</p>
            </div>
          </div>
          <button
            onClick={() => generateDocument('receipt')}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            Generate
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">KYC Certificates</h3>
              <p className="text-sm text-gray-500">Verification status</p>
            </div>
          </div>
          <button
            onClick={() => generateDocument('kyc')}
            className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Documents</h3>
        </div>
        <div className="p-6">
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map(renderDocumentCard)}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents generated yet</p>
              <p className="text-sm text-gray-500 mt-1">Generate your first document using the options above</p>
            </div>
          )}
        </div>
      </div>

      {/* Generation Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statement Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current">Current Month</option>
              <option value="last">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Period</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Format
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 