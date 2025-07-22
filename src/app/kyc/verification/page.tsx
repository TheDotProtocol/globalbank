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
  EyeOff,
  Smartphone,
  Tablet,
  Image as ImageIcon
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
  const [isMobile, setIsMobile] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    checkAuthAndKYCStatus();
    detectMobileDevice();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const detectMobileDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(isMobileDevice);
    console.log('📱 Device detected:', isMobileDevice ? 'Mobile/Tablet' : 'Desktop');
  };

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
    console.log(`📁 File selected for ${field}:`, {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
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
    setCameraError(null);
  };

  const takePhoto = () => {
    const video = document.getElementById('video') as HTMLVideoElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (video && canvas && context) {
      // Use video dimensions for better quality on mobile
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setFormData(prev => ({ ...prev, selfie: file }));
          setCapturedImage(canvas.toDataURL('image/jpeg'));
          console.log('📸 Selfie captured:', {
            size: blob.size,
            type: blob.type
          });
        }
      }, 'image/jpeg', 0.9); // Higher quality for mobile
    }
    setShowSelfie(false);
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Mobile-optimized camera constraints
      const constraints = {
        video: {
          facingMode: 'user', // Use front camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1.7777777778 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      const video = document.getElementById('video') as HTMLVideoElement;
      if (video) {
        video.srcObject = mediaStream;
        await video.play();
        console.log('📹 Camera started successfully');
      }
    } catch (error: any) {
      console.error('❌ Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. Please ensure camera permissions are granted.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device.';
      }
      
      setCameraError(errorMessage);
      alert(errorMessage);
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

      console.log('📤 Starting KYC submission...', {
        governmentId: formData.governmentId?.name,
        proofOfAddress: formData.proofOfAddress?.name,
        selfie: formData.selfie?.name
      });

      const formDataToSend = new FormData();
      formDataToSend.append('governmentId', formData.governmentId);
      formDataToSend.append('proofOfAddress', formData.proofOfAddress);
      formDataToSend.append('selfie', formData.selfie);
      
      formData.additionalDocuments.forEach((doc, index) => {
        formDataToSend.append(`additionalDocuments`, doc);
      });

      console.log('📤 Submitting KYC documents to API...');

      // First, test with debug endpoint
      console.log('🔍 Testing with debug endpoint first...');
      const testResponse = await fetch('/api/test-kyc-upload', {
        method: 'POST',
        body: formDataToSend
      });

      console.log('🔍 Test response status:', testResponse.status);
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        console.log('✅ Test successful:', testResult);
      } else {
        const testError = await testResponse.json();
        console.error('❌ Test failed:', testError);
      }

      // Now try the real KYC upload
      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('📤 API Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ KYC submission successful:', result);
        alert('KYC documents submitted successfully! Please wait for admin approval.');
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('❌ KYC submission failed:', errorData);
        const errorMessage = errorData.error || errorData.message || errorData.details || 'Failed to submit KYC documents';
        alert(`Error: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('❌ Error submitting KYC:', error);
      const errorMessage = error.message || 'Network error occurred. Please check your connection and try again.';
      alert(`Error: ${errorMessage}`);
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
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Mobile Device Indicator */}
        {isMobile && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-center space-x-2 text-blue-800 dark:text-blue-200">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium">Mobile Optimized Experience</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            KYC Verification
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Complete your identity verification to access all banking features
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
            Step {currentStep} of 4: {
              currentStep === 1 ? 'Government ID' :
              currentStep === 2 ? 'Proof of Address' :
              currentStep === 3 ? 'Selfie Verification' :
              'Review & Submit'
            }
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Government ID Upload
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Please upload a clear photo of your government-issued ID
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-8 text-center">
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Accepted formats: Passport, Driver's License, National ID Card, Voter's License
                </p>
                
                {isMobile ? (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('governmentId', e.target.files[0])}
                      className="hidden"
                      id="governmentId-camera"
                    />
                    <label
                      htmlFor="governmentId-camera"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Take Photo
                    </label>
                    
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('governmentId', e.target.files[0])}
                      className="hidden"
                      id="governmentId-gallery"
                    />
                    <label
                      htmlFor="governmentId-gallery"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Choose from Gallery
                    </label>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {formData.governmentId && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                    <span className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                      {formData.governmentId.name} uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <Home className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Proof of Address
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Upload a recent utility bill (within 2 months)
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-8 text-center">
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Recent utility bill (electricity, water, gas, internet, etc.)
                </p>
                
                {isMobile ? (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfAddress', e.target.files[0])}
                      className="hidden"
                      id="proofOfAddress-camera"
                    />
                    <label
                      htmlFor="proofOfAddress-camera"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Take Photo
                    </label>
                    
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('proofOfAddress', e.target.files[0])}
                      className="hidden"
                      id="proofOfAddress-gallery"
                    />
                    <label
                      htmlFor="proofOfAddress-gallery"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Choose from Gallery
                    </label>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {formData.proofOfAddress && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                    <span className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                      {formData.proofOfAddress.name} uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Selfie Verification
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Take a clear selfie for identity verification
                </p>
              </div>

              {!showSelfie && !capturedImage && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-8 text-center">
                  <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Click below to start camera and take a selfie
                  </p>
                  <button
                    onClick={captureSelfie}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                    muted
                  />
                  {cameraError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{cameraError}</p>
                    </div>
                  )}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base"
                    >
                      Start Camera
                    </button>
                    <button
                      onClick={takePhoto}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
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
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                      <span className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                        Selfie captured successfully
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={captureSelfie}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Review & Submit
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Please review your uploaded documents before submission
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Uploaded Documents:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Government ID: {formData.governmentId?.name}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Proof of Address: {formData.proofOfAddress?.name}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        Selfie: Captured successfully
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">Important Notes:</h3>
                  <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
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
          <div className="flex justify-between mt-6 sm:mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={submitKYC}
                disabled={loading}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm sm:text-base"
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