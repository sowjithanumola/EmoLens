
import React, { useState } from 'react';
import { EmotionAnalysis } from '../types';
import { speakText, initializeAudio } from '../services/geminiService';

interface AnalysisResultProps {
  result: EmotionAnalysis | null;
  error?: string | null;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, error }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlayVoice = async () => {
    if (!result?.explanation || isSpeaking) return;
    initializeAudio();
    setIsSpeaking(true);
    await speakText(result.explanation);
    setIsSpeaking(false);
  };

  if (error) return (
    <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 text-rose-600">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-rose-900 mb-2 tracking-tight">System Error</h3>
      <p className="text-rose-700 text-sm leading-relaxed">{error}</p>
    </div>
  );

  if (!result) return (
    <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-indigo-50 rounded-full animate-ping opacity-20"></div>
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 relative">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900 mb-2">EmoLens Insight</p>
      <p className="text-sm max-w-xs text-center leading-relaxed">I am ready to analyze your expression. Capture a frame to receive your first observation.</p>
    </div>
  );

  if (!result.isFaceDetected) return (
    <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 text-amber-600">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-amber-900 mb-3 tracking-tight">Detection Issue</h3>
      <p className="text-amber-800 text-sm max-w-xs leading-relaxed">I can't see your face clearly. Please adjust your lighting or position and try again.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">EmoLens Insight</h3>
        </div>
        <div className="mono text-[10px] text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
          LOG: {result.id}
        </div>
      </div>
      
      <div className="p-8 space-y-10">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Primary State</label>
            <div className="text-4xl font-black text-slate-900 capitalize tracking-tight">{result.primaryEmotion}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Intensity</label>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{result.intensity}</span>
              <span className="text-slate-300 font-bold text-sm">/10</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
              style={{ width: `${result.intensity * 10}%` }}
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative p-8 bg-slate-900 rounded-3xl text-white shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observation</span>
              </div>
              <button 
                onClick={handlePlayVoice}
                disabled={isSpeaking}
                className={`p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10 flex items-center gap-2 group/mic ${isSpeaking ? 'opacity-20 scale-95' : 'opacity-100 hover:scale-110 active:scale-95'}`}
                title="Listen to analysis"
              >
                <svg className={`w-5 h-5 ${isSpeaking ? 'animate-pulse text-indigo-400' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                {isSpeaking ? (
                   <span className="text-[9px] font-black uppercase tracking-widest">Speaking...</span>
                ) : (
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/mic:opacity-100 transition-opacity">Listen</span>
                )}
              </button>
            </div>
            
            <p className="text-xl leading-relaxed font-medium italic text-slate-200">
              "{result.explanation}"
            </p>

            {isSpeaking && (
              <div className="mt-6 flex items-end gap-1.5 h-8">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-indigo-400/50 rounded-full animate-bounce"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`, 
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
