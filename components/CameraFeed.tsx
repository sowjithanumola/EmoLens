
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraFeedProps {
  onCapture: (base64Image: string) => void;
  isAnalyzing: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorType, setErrorType] = useState<'denied' | 'other' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setErrorType(null);
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorType('denied');
        setErrorMessage("Camera access was denied. Please check your browser settings and click the camera icon in your address bar to allow access.");
      } else {
        setErrorType('other');
        setErrorMessage(err.message || "Unable to access camera. Please ensure it's connected and not in use by another app.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-gray-900 shadow-2xl group">
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center aspect-video p-8 text-center bg-gray-800">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">
            {errorType === 'denied' ? 'Camera Access Required' : 'Camera Error'}
          </h3>
          <p className="text-gray-400 font-medium mb-8 max-w-md">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={startCamera}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              Reload Page
            </button>
          </div>
          {errorType === 'denied' && (
            <p className="mt-8 text-xs text-gray-500 max-w-sm">
              Tip: Look for a camera icon in the top right or left of your browser address bar to manage permissions.
            </p>
          )}
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          {!stream && !errorMessage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover mirror transform scale-x-[-1] transition-opacity duration-500 ${stream ? 'opacity-100' : 'opacity-0'}`}
          />
          
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/30 transition-colors pointer-events-none"></div>

          {/* Analysis Overlay Effect */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[1px] flex items-center justify-center">
              <div className="w-full h-1 bg-indigo-500/50 absolute top-0 animate-[scan_2s_linear_infinite]"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-semibold mt-4 drop-shadow-md">Analyzing Expression...</span>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          {stream && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
              <button
                onClick={captureFrame}
                disabled={isAnalyzing}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-full font-bold shadow-xl transition-all active:scale-95
                  ${isAnalyzing 
                    ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-indigo-500/40'}
                `}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {isAnalyzing ? "Processing..." : "Analyze Expression"}
              </button>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { top: 100%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default CameraFeed;
