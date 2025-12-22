
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
    <div className="bg-rose-50 rounded-2xl p-8 shadow-sm border border-rose-100 flex flex-col items-center justify-center text-center min-h-[300px] animate-in fade-in duration-300">
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
      <p className="text-sm">Click "Analyze Expression" to start</p>
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
      <h3 className="text-xl font-bold text-gray-800 mb-2">Face Not Clear Enough</h3>
      <p className="text-gray-600 max-w-xs">I couldn't quite see your expression. Try adjusting the lighting or centering yourself in the frame.</p>
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
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Analysis Result</h3>
          {isSpeaking && (
            <div className="flex gap-1 items-center ml-2">
              <div className="w-1 h-3 bg-indigo-500 animate-[bounce_0.6s_ease-in-out_infinite]"></div>
              <div className="w-1 h-4 bg-indigo-500 animate-[bounce_0.8s_ease-in-out_infinite]"></div>
              <div className="w-1 h-2 bg-indigo-500 animate-[bounce_0.7s_ease-in-out_infinite]"></div>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Detected Emotion</label>
            <div className="text-4xl font-black text-gray-900 capitalize tracking-tight">{result.primaryEmotion}</div>
          </div>
          
          {result.secondaryEmotion && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Subtle Tones</label>
              <div className="text-2xl font-bold text-gray-600 capitalize">{result.secondaryEmotion}</div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Intensity</label>
            <span className="text-2xl font-black text-gray-800">{result.intensity}<span className="text-sm text-gray-400 font-medium">/10</span></span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${intensityColor(result.intensity)}`}
              style={{ width: `${result.intensity * 10}%` }}
            />
          </div>
        </div>

        <div className="relative p-6 bg-indigo-50 rounded-2xl border border-indigo-100 group">
          <button 
            onClick={handleReplay}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-indigo-500 active:scale-90"
            title="Listen again"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <div className="flex gap-4">
            <div className="mt-1">
              <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-indigo-900 leading-relaxed italic pr-8">
              "{result.explanation}"
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-4 bg-gray-50 flex items-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        AI analysis. Non-diagnostic. Results are audible.
      </div>
    </div>
  );
};

export default AnalysisResult;
