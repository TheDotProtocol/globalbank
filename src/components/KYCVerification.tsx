'use client';

import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Camera, FileText, User, MapPin } from 'lucide-react';

interface KYCVerificationProps {
  userId: string;
  onStatusChange?: (status: string) => void;
}

interface KYCStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'in_progress';
  required: boolean;
}

interface DocumentUpload {
  type: string;
  file: File;
  preview?: string;
}

export default function KYCVerification({ userId, onStatusChange }: KYCVerificationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [kycStatus, setKycStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    occupation: '',
    sourceOfFunds: '',
  });

  const [steps] = useState<KYCStep[]>([
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Provide your basic personal details',
      status: 'pending',
      required: true,
    },
    {
      id: 'identity_verification',
      title: 'Identity Verification',
      description: 'Upload government-issued ID documents',
      status: 'pending',
      required: true,
    },
    {
      id: 'address_verification',
      title: 'Address Verification',
      description: 'Provide proof of address',
      status: 'pending',
      required: true,
    },
    {
      id: 'selfie_verification',
      title: 'Selfie Verification',
      description: 'Take a photo for identity verification',
      status: 'pending',
      required: true,
    },
    {
      id: 'income_verification',
      title: 'Income Verification',
      description: 'Provide proof of income (optional)',
      status: 'pending',
      required: false,
    },
  ]);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch(`/api/kyc/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.status);
        onStatusChange?.(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    }
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/kyc/personal-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...personalInfo }),
      });

      if (response.ok) {
        updateStepStatus(0, 'completed');
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Failed to submit personal info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (type: string, file: File) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('userId', userId);

      const response = await fetch('/api/kyc/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(prev => [...prev, { type, file, preview: data.preview }]);
        
        // Update step status based on document type
        if (type === 'ID_PROOF') {
          updateStepStatus(1, 'completed');
          setCurrentStep(2);
        } else if (type === 'ADDRESS_PROOF') {
          updateStepStatus(2, 'completed');
          setCurrentStep(3);
        }
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieCapture = async (file: File) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/kyc/selfie-verification', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        updateStepStatus(3, 'completed');
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Failed to upload selfie:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStepStatus = (stepIndex: number, status: KYCStep['status']) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].status = status;
    // Update steps state
  };

  const getStatusIcon = (status: KYCStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <select
                  required
                  value={personalInfo.nationality}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, nationality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Nationality</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IN">India</option>
                  <option value="TH">Thailand</option>
                  <option value="SG">Singapore</option>
                  <option value="MY">Malaysia</option>
                  <option value="PH">Philippines</option>
                  <option value="VN">Vietnam</option>
                  <option value="ID">Indonesia</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="CN">China</option>
                  <option value="HK">Hong Kong</option>
                  <option value="TW">Taiwan</option>
                  <option value="AE">UAE</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="QA">Qatar</option>
                  <option value="KW">Kuwait</option>
                  <option value="BH">Bahrain</option>
                  <option value="OM">Oman</option>
                  <option value="JO">Jordan</option>
                  <option value="LB">Lebanon</option>
                  <option value="EG">Egypt</option>
                  <option value="NG">Nigeria</option>
                  <option value="KE">Kenya</option>
                  <option value="GH">Ghana</option>
                  <option value="UG">Uganda</option>
                  <option value="TZ">Tanzania</option>
                  <option value="ZM">Zambia</option>
                  <option value="MW">Malawi</option>
                  <option value="BW">Botswana</option>
                  <option value="NA">Namibia</option>
                  <option value="MU">Mauritius</option>
                  <option value="SC">Seychelles</option>
                  <option value="MA">Morocco</option>
                  <option value="TN">Tunisia</option>
                  <option value="DZ">Algeria</option>
                  <option value="LY">Libya</option>
                  <option value="SD">Sudan</option>
                  <option value="ET">Ethiopia</option>
                  <option value="SO">Somalia</option>
                  <option value="DJ">Djibouti</option>
                  <option value="KM">Comoros</option>
                  <option value="MG">Madagascar</option>
                  <option value="MZ">Mozambique</option>
                  <option value="ZW">Zimbabwe</option>
                  <option value="BI">Burundi</option>
                  <option value="RW">Rwanda</option>
                  <option value="CD">DR Congo</option>
                  <option value="CF">Central African Republic</option>
                  <option value="CI">Ivory Coast</option>
                  <option value="PF">French Polynesia</option>
                  <option value="CL">Chile</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                  <option value="PE">Peru</option>
                  <option value="UY">Uruguay</option>
                  <option value="PY">Paraguay</option>
                  <option value="BO">Bolivia</option>
                  <option value="VE">Venezuela</option>
                  <option value="GT">Guatemala</option>
                  <option value="HN">Honduras</option>
                  <option value="NI">Nicaragua</option>
                  <option value="CR">Costa Rica</option>
                  <option value="PA">Panama</option>
                  <option value="DO">Dominican Republic</option>
                  <option value="JM">Jamaica</option>
                  <option value="TT">Trinidad and Tobago</option>
                  <option value="BB">Barbados</option>
                  <option value="AG">Antigua and Barbuda</option>
                  <option value="BZ">Belize</option>
                  <option value="GY">Guyana</option>
                  <option value="SR">Suriname</option>
                  <option value="FJ">Fiji</option>
                  <option value="WS">Samoa</option>
                  <option value="TO">Tonga</option>
                  <option value="VU">Vanuatu</option>
                  <option value="SB">Solomon Islands</option>
                  <option value="PG">Papua New Guinea</option>
                  <option value="KI">Kiribati</option>
                  <option value="TV">Tuvalu</option>
                  <option value="NP">Nepal</option>
                  <option value="BD">Bangladesh</option>
                  <option value="PK">Pakistan</option>
                  <option value="LK">Sri Lanka</option>
                  <option value="MM">Myanmar</option>
                  <option value="KH">Cambodia</option>
                  <option value="LA">Laos</option>
                  <option value="MN">Mongolia</option>
                  <option value="KZ">Kazakhstan</option>
                  <option value="UZ">Uzbekistan</option>
                  <option value="KG">Kyrgyzstan</option>
                  <option value="TJ">Tajikistan</option>
                  <option value="TM">Turkmenistan</option>
                  <option value="AZ">Azerbaijan</option>
                  <option value="GE">Georgia</option>
                  <option value="AM">Armenia</option>
                  <option value="BY">Belarus</option>
                  <option value="MD">Moldova</option>
                  <option value="UA">Ukraine</option>
                  <option value="RS">Serbia</option>
                  <option value="BG">Bulgaria</option>
                  <option value="HR">Croatia</option>
                  <option value="AL">Albania</option>
                  <option value="MK">North Macedonia</option>
                  <option value="BA">Bosnia and Herzegovina</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={personalInfo.country}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                required
                rows={3}
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation *
                </label>
                <input
                  type="text"
                  required
                  value={personalInfo.occupation}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, occupation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source of Funds *
              </label>
              <select
                required
                value={personalInfo.sourceOfFunds}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, sourceOfFunds: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Source of Funds</option>
                <option value="SALARY">Salary/Employment</option>
                <option value="BUSINESS">Business Income</option>
                <option value="INVESTMENT">Investment Returns</option>
                <option value="INHERITANCE">Inheritance</option>
                <option value="GIFT">Gift</option>
                <option value="SAVINGS">Savings</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Continue'}
            </button>
          </form>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Identity Verification</h3>
              <p className="text-blue-700 text-sm">
                Please upload a clear photo of your government-issued ID document. 
                Accepted formats: Passport, National ID, Driver's License
              </p>
            </div>
            
            <DocumentUploader
              type="ID_PROOF"
              onUpload={handleDocumentUpload}
              acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Address Verification</h3>
              <p className="text-blue-700 text-sm">
                Please upload a document that proves your current address. 
                Accepted documents: Utility bill, Bank statement, Rental agreement
              </p>
            </div>
            
            <DocumentUploader
              type="ADDRESS_PROOF"
              onUpload={handleDocumentUpload}
              acceptedTypes={['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Selfie Verification</h3>
              <p className="text-blue-700 text-sm">
                Please take a clear photo of yourself holding your ID document. 
                This helps us verify your identity and prevent fraud.
              </p>
            </div>
            
            <SelfieCapture onCapture={handleSelfieCapture} />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">KYC Verification Complete</h3>
              <p className="text-green-700 text-sm">
                Thank you for completing the KYC verification process. 
                Your documents are being reviewed and you will be notified once verified.
              </p>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Submitted</h3>
              <p className="text-gray-600">
                Your KYC verification has been submitted successfully. 
                We will review your documents and update your status within 24-48 hours.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification</h2>
          <p className="text-gray-600">
            Complete the verification process to unlock all banking features
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  {getStatusIcon(step.status)}
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 bg-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}

// Document Uploader Component
interface DocumentUploaderProps {
  type: string;
  onUpload: (type: string, file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
}

function DocumentUploader({ type, onUpload, acceptedTypes, maxSize }: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a valid document.');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File too large. Please upload a smaller file.');
      return;
    }

    setUploading(true);
    onUpload(type, file);
    setUploading(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Upload {type.replace('_', ' ')}
      </h3>
      <p className="text-gray-600 mb-4">
        Drag and drop your document here, or click to browse
      </p>
      <input
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        id={`file-upload-${type}`}
      />
      <label
        htmlFor={`file-upload-${type}`}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </label>
    </div>
  );
}

// Selfie Capture Component
interface SelfieCaptureProps {
  onCapture: (file: File) => void;
}

function SelfieCapture({ onCapture }: SelfieCaptureProps) {
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const captureSelfie = () => {
    setCapturing(true);
    // In a real implementation, this would use the device camera
    // For now, we'll simulate with a file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string);
          onCapture(file);
        };
        reader.readAsDataURL(file);
      }
      setCapturing(false);
    };
    input.click();
  };

  return (
    <div className="text-center">
      {!capturedImage ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Take a Selfie
          </h3>
          <p className="text-gray-600 mb-4">
            Please take a clear photo of yourself holding your ID document
          </p>
          <button
            onClick={captureSelfie}
            disabled={capturing}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {capturing ? 'Capturing...' : 'Take Photo'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-64 h-64 object-cover rounded-lg mx-auto"
          />
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setCapturedImage(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Retake
            </button>
            <button
              onClick={() => {/* Submit the captured image */}}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 