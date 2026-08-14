import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, Copy, Check, Sparkles, Image as ImageIcon, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExtractedText: (text: string, title?: string) => void;
}

export default function CameraScannerModal({
  isOpen,
  onClose,
  onSelectExtractedText,
}: CameraScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraRequested, setIsCameraRequested] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [documentTitle, setDocumentTitle] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manage camera lifecycle (only request stream if camera is explicitly opened by user)
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && isCameraRequested && !selectedImage) {
      startCamera();
    } else {
      stopCameraStreamOnly();
    }

    return () => {
      stopCameraStreamOnly();
    };
  }, [isOpen, activeTab, facingMode, selectedImage, isCameraRequested]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraRequested(true);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Unable to access camera. Please allow camera permissions or upload an image file instead.'
      );
    }
  };

  const stopCameraStreamOnly = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const stopCamera = () => {
    stopCameraStreamOnly();
    setIsCameraRequested(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture image from video feed
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setSelectedImage(imageDataUrl);
    stopCamera();
    processOCR(imageDataUrl);
  };

  // Handle image upload from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      processOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Send image to backend OCR endpoint
  const processOCR = async (imageData: string) => {
    setIsScanning(true);
    setScanError(null);
    setExtractedText('');

    try {
      const res = await fetch('/api/scan-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to extract text from image');
      }

      setExtractedText(data.extractedText || '');
      setDocumentTitle(`Scanned Script ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (err: any) {
      console.error('OCR scanning error:', err);
      setScanError(err.message || 'Could not scan image. Please try a clearer photo.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setExtractedText('');
    setScanError(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyText = () => {
    if (!extractedText.trim()) return;
    onSelectExtractedText(extractedText.trim(), documentTitle || 'Scanned Document');
    handleCloseModal();
  };

  const handleCloseModal = () => {
    stopCamera();
    setSelectedImage(null);
    setExtractedText('');
    setScanError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="camera-modal-overlay">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={handleCloseModal} />

      {/* Hidden canvas for taking snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Modal Window */}
      <div
        id="camera-modal-content"
        className="relative bg-theme-card border border-theme-muted/30 rounded-2xl w-full max-w-2xl p-5 md:p-6 shadow-2xl z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-theme-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-theme-accent">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-correct font-sans flex items-center gap-2">
                <span>Camera & Document Scanner</span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-theme-accent/15 text-theme-accent border border-theme-accent/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI OCR
                </span>
              </h3>
              <p className="text-xs text-theme-muted">
                Snap or upload any text, script, or book page to convert it into a typing test
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-theme-muted hover:text-theme-correct hover:bg-theme-muted/20 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection (only if no image selected yet) */}
        {!selectedImage && (
          <div className="flex items-center gap-2 my-4 p-1 bg-theme-bg/60 rounded-xl border border-theme-muted/20">
            <button
              onClick={() => {
                setActiveTab('camera');
                setSelectedImage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-theme-accent text-theme-bg shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-theme-accent text-theme-bg shadow-sm'
                  : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo / Document</span>
            </button>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2">
          {/* 1. Camera View Mode */}
          {!selectedImage && activeTab === 'camera' && (
            <div className="space-y-3">
              {!isCameraRequested ? (
                <div className="border-2 border-dashed border-theme-muted/40 bg-theme-bg/30 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-theme-accent flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-semibold text-theme-correct">Ready to scan with live camera?</h4>
                    <p className="text-xs text-theme-muted">
                      Click "Open Camera" to grant camera access and start scanning text from documents, books, or notes.
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-6 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-theme-bg font-bold text-xs md:text-sm shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera</span>
                  </button>
                </div>
              ) : cameraError ? (
                <div className="p-6 rounded-2xl bg-theme-wrong/10 border border-theme-wrong/30 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-theme-wrong mx-auto" />
                  <p className="text-xs text-theme-text font-medium">{cameraError}</p>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-theme-accent text-theme-bg font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-theme-muted/30 text-theme-text font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image File Instead</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-theme-muted/30 aspect-video flex items-center justify-center shadow-inner group">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Overlay Frame */}
                  <div className="absolute inset-4 border-2 border-dashed border-theme-accent/50 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="text-[10px] font-mono bg-black/60 text-theme-accent backdrop-blur-sm px-3 py-1 rounded-full border border-theme-accent/30">
                      Position text inside frame & hold steady
                    </div>
                  </div>

                  {/* Camera Action Buttons Overlay */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
                    <button
                      onClick={toggleCameraFacing}
                      className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
                      title="Flip Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={capturePhoto}
                      disabled={!isCameraActive}
                      className="px-6 py-3 rounded-full bg-theme-accent hover:bg-theme-accent-hover text-theme-bg font-bold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Snap & Scan</span>
                    </button>

                    <button
                      onClick={stopCamera}
                      className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
                      title="Turn Off Camera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Upload File Mode */}
          {!selectedImage && activeTab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-theme-muted/40 hover:border-theme-accent/60 bg-theme-bg/30 hover:bg-theme-bg/60 rounded-2xl p-8 text-center transition-all cursor-pointer space-y-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-theme-accent/10 border border-theme-accent/20 text-theme-accent flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-theme-correct">Choose or Drop an Image</h4>
                <p className="text-xs text-theme-muted mt-1">
                  Supports JPG, PNG, WEBP photos of scripts, pages, or handwritten notes
                </p>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-lg bg-theme-accent/15 text-theme-accent font-medium text-xs border border-theme-accent/30">
                Browse Image File
              </span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 3. Image Scanning / Result View */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thumbnail Preview with Scanning Effect */}
                <div className="relative rounded-xl overflow-hidden bg-black/40 border border-theme-muted/30 aspect-video md:aspect-square flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Captured preview"
                    className="w-full h-full object-contain"
                  />

                  {isScanning && (
                    <div className="absolute inset-0 bg-theme-bg/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 space-y-3">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-theme-accent/20 border-t-theme-accent animate-spin" />
                        <Sparkles className="w-5 h-5 text-theme-accent absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <span className="text-xs font-semibold text-theme-correct animate-pulse">
                        Scanning Text with Gemini AI OCR...
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1 rounded-lg border border-white/20 backdrop-blur-sm flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>

                {/* OCR Text Output & Edit */}
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-theme-muted tracking-wider uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-theme-accent" /> Extracted Script Text
                    </label>
                    {extractedText && (
                      <button
                        onClick={handleCopy}
                        className="text-xs text-theme-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {scanError ? (
                    <div className="p-4 rounded-xl bg-theme-wrong/10 border border-theme-wrong/30 text-theme-wrong text-xs space-y-2 flex-1 flex flex-col justify-center items-center text-center">
                      <AlertCircle className="w-6 h-6" />
                      <p>{scanError}</p>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-theme-wrong/20 hover:bg-theme-wrong/30 text-theme-text rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Try Another Image
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        placeholder={isScanning ? 'Extracting text...' : 'Extracted text will appear here. You can edit or verify before starting practice.'}
                        rows={6}
                        disabled={isScanning}
                        className="w-full flex-1 bg-theme-bg border border-theme-muted/20 rounded-xl p-3 text-xs md:text-sm text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent/50 font-mono resize-none"
                      />

                      <input
                        type="text"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Document Title (e.g. History Page, Notes...)"
                        disabled={isScanning}
                        className="w-full bg-theme-bg border border-theme-muted/20 rounded-lg px-3 py-1.5 text-xs text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent/50"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-theme-muted/20 flex items-center justify-between gap-3">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 border border-theme-muted/30 text-theme-text/80 hover:text-theme-text rounded-lg text-xs md:text-sm hover:bg-theme-muted/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {extractedText && (
            <button
              onClick={handleApplyText}
              className="px-5 py-2.5 bg-theme-accent hover:bg-theme-accent-hover text-theme-bg font-semibold text-xs md:text-sm rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-98 cursor-pointer"
            >
              <span>Save & Start Practice Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
