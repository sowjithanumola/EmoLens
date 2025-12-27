import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraFeedProps {
  onCapture: (base64Image: string) => void;
  isAnalyzing: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setError(null);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setError(err.name === 'NotAllowedError' ? "Permission Denied" : "Camera Error");
    }
  };

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    onCapture(canvasRef.current.toDataURL('image/jpeg', 0.85));
  }, [onCapture, isAnalyzing]);

  return (
    <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 border-[12px] border-white shadow-2xl group ring-1 ring-slate-200">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-white text-lg font-bold mb-2">{error}</h3>
          <p className="text-slate-400 text-sm max-w-xs mb-6">We need access to your camera to analyze your expressions.</p>
          <button onClick={startCamera} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-500 transition-colors">Grant Access</button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover mirror transition-opacity duration-1000 ${stream ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* HUD Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
            
            {/* Scanning Line */}
            {isAnalyzing && <div className="absolute top-0 left-0 right-0 scan-line z-10"></div>}
            
            {/* Center Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/10 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={captureFrame}
              disabled={isAnalyzing || !stream}
              className={`
                group/btn relative px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all
                ${isAnalyzing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-white text-indigo-600 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-95'}
              `}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAnalyzing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
                {isAnalyzing ? "Processing..." : "Capture Reaction"}
              </div>
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFeed;