"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Camera, 
  FileText, 
  Home, 
  User, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface KYCFormData {
  governmentId: File | null;
  proofOfAddress: File | null;
  selfie: File | null;
  additionalDocuments: File[];
}

export default function KYCVerificationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    governmentId: null,
    proofOfAddress: null,
    selfie: null,
    additionalDocuments: []
  });
  const [loading, setLoading] = useState(false);
  const [showSelfie, setShowSelfie] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndKYCStatus();
  }, []);

  const checkAuthAndKYCStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        if (data.kycStatus === 'APPROVED') {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const handleFileUpload = (field: keyof KYCFormData, file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleMultipleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      additionalDocuments: [...prev.additionalDocuments, ...fileArray]
    }));
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
          setFormData(prev => ({ ...prev, selfie: file }));
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

  const submitKYC = async () => {
    if (!formData.governmentId || !formData.proofOfAddress || !formData.selfie) {
      alert('Please upload all required documents');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('governmentId', formData.governmentId);
      formDataToSend.append('proofOfAddress', formData.proofOfAddress);
      formDataToSend.append('selfie', formData.selfie);
      
      formData.additionalDocuments.forEach((doc, index) => {
        formDataToSend.append(`additionalDocuments`, doc);
      });

      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('KYC documents submitted successfully! Please wait for admin approval.');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to submit KYC documents';
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error submitting KYC:', error);
      alert('Error submitting KYC documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.governmentId !== null;
      case 2:
        return formData.proofOfAddress !== null;
      case 3:
        return formData.selfie !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            KYC Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your identity verification to access all banking features
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Step {currentStep} of 4: {
              currentStep === 1 ? 'Government ID' :
              currentStep === 2 ? 'Proof of Address' :
              currentStep === 3 ? 'Selfie Verification' :
              'Review & Submit'
            }
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Government ID Upload
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please upload a clear photo of your government-issued ID
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Accepted formats: Passport, Driver's License, National ID Card, Voter's License
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('governmentId', e.target.files[0])}
                  className="hidden"
                  id="governmentId"
                />
                <label
                  htmlFor="governmentId"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose File
                </label>
              </div>

              {formData.governmentId && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 dark:text-green-200">
                      {formData.governmentId.name} uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Home className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Proof of Address
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload a recent utility bill (within 2 months)
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Recent utility bill (electricity, water, gas, internet, etc.)
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfAddress', e.target.files[0])}
                  className="hidden"
                  id="proofOfAddress"
                />
                <label
                  htmlFor="proofOfAddress"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose File
                </label>
              </div>

              {formData.proofOfAddress && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 dark:text-green-200">
                      {formData.proofOfAddress.name} uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Camera className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Selfie Verification
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Take a clear selfie for identity verification
                </p>
              </div>

              {!showSelfie && !capturedImage && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Click below to start camera and take a selfie
                  </p>
                  <button
                    onClick={captureSelfie}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Camera
                  </button>
                </div>
              )}

              {showSelfie && (
                <div className="space-y-4">
                  <video
                    id="video"
                    className="w-full rounded-lg"
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
              )}

              {capturedImage && (
                <div className="space-y-4">
                  <img
                    src={capturedImage}
                    alt="Captured selfie"
                    className="w-full rounded-lg"
                  />
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 dark:text-green-200">
                        Selfie captured successfully
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={captureSelfie}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Review & Submit
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please review your uploaded documents before submission
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Uploaded Documents:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Government ID: {formData.governmentId?.name}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Proof of Address: {formData.proofOfAddress?.name}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Selfie: Captured successfully
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important Notes:</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Your documents will be reviewed by our admin team</li>
                    <li>• Processing time: 24-48 hours</li>
                    <li>• You'll receive email notifications on status updates</li>
                    <li>• All documents are encrypted and securely stored</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={submitKYC}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit KYC
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 