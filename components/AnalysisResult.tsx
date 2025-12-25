
import React, { useState } from 'react';
import { EmotionAnalysis } from '../types';
import { speakText } from '../services/geminiService';

interface AnalysisResultProps {
  result: EmotionAnalysis | null;
  error?: string | null;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, error }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReplay = async () => {
    if (!result?.explanation) return;
    setIsSpeaking(true);
    await speakText(result.explanation);
    setIsSpeaking(false);
  };

  if (error) return (
    <div className="bg-rose-50 rounded-2xl p-8 shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-rose-900 mb-2">Analysis Failed</h3>
      <p className="text-rose-700 text-sm max-w-xs">{error}</p>
    </div>
  );

  if (!result) return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
      <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-lg font-medium">Ready for your expression</p>
      <p className="text-sm">Position your face and click "Analyze"</p>
    </div>
  );

  if (!result.isFaceDetected) return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-yellow-400 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Face Not Detected</h3>
      <p className="text-gray-600 max-w-xs">I can't see your expression clearly. Try moving closer to the camera or improving the lighting.</p>
    </div>
  );

  const intensityColor = (val: number) => {
    if (val < 4) return 'bg-emerald-500';
    if (val < 7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Analysis Panel</h3>
          {isSpeaking && (
            <div className="flex gap-1 items-center ml-4 px-2 py-1 bg-indigo-100 rounded-full">
              <span className="text-[10px] font-black text-indigo-600 uppercase">Speaking</span>
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-400 font-bold">{new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Primary</label>
            <div className="text-3xl font-black text-gray-900 capitalize">{result.primaryEmotion}</div>
          </div>
          {result.secondaryEmotion && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Secondary</label>
              <div className="text-xl font-bold text-gray-500 capitalize">{result.secondaryEmotion}</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Intensity Level</label>
            <span className="text-xl font-black text-gray-800">{result.intensity}<span className="text-sm text-gray-300">/10</span></span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${intensityColor(result.intensity)}`}
              style={{ width: `${result.intensity * 10}%` }}
            />
          </div>
        </div>

        <div className="relative p-6 bg-slate-900 rounded-2xl text-white group overflow-hidden shadow-xl shadow-indigo-100">
          <div className="absolute top-0 right-0 p-3">
             <button 
              onClick={handleReplay}
              disabled={isSpeaking}
              className={`p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all ${isSpeaking ? 'opacity-20' : 'opacity-100'}`}
              title="Replay Audio"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">AI Observation</p>
          <p className="text-lg leading-relaxed font-medium italic">
            "{result.explanation}"
          </p>
          {isSpeaking && (
            <div className="mt-4 flex gap-2 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-indigo-500/30 rounded-full animate-pulse"
                  style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="px-8 py-4 bg-gray-50 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        Audio Analysis Active
      </div>
    </div>
  );
};

export default AnalysisResult;
