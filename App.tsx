
import React, { useState, useCallback } from 'react';
import CameraFeed from './components/CameraFeed';
import AnalysisResult from './components/AnalysisResult';
import { analyzeEmotionFromImage, speakText, initializeAudio } from './services/geminiService';
import { EmotionAnalysis, AnalysisStatus } from './types';

const App: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [history, setHistory] = useState<EmotionAnalysis[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64Image: string) => {
    // CRITICAL: Initialize and resume audio on the user's click interaction
    initializeAudio();
    
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const result = await analyzeEmotionFromImage(base64Image);
      setCurrentAnalysis(result);
      
      if (result.isFaceDetected) {
        setHistory(prev => [result, ...prev].slice(0, 10));
        setStatus(AnalysisStatus.SUCCESS);
        // Automatically speak the analysis
        await speakText(result.explanation);
      } else {
        setStatus(AnalysisStatus.SUCCESS);
      }
      
    } catch (err: any) {
      console.error("Mentor AI Analysis Error:", err);
      setError(err?.message || "I encountered an issue analyzing the frame. Please try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Mentor AI Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* The Requested Smiley Logo */}
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Mentor AI</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Emotion Analysis Engine</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
              Observer Active
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Observational Stream
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Ready
                </div>
              </div>
              <CameraFeed 
                onCapture={handleCapture} 
                isAnalyzing={status === AnalysisStatus.LOADING} 
              />
            </section>

            <div className="lg:hidden">
              <AnalysisResult result={currentAnalysis} error={error} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Audible Insights', desc: 'Mentor AI speaks its observations out loud using advanced speech synthesis.', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
                { title: 'Mentor AI Core', desc: 'World-class vision intelligence designed to interpret micro-expressions.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                { title: 'Data Privacy', desc: 'Processing happens in-session. No facial data is ever stored permanently.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="hidden lg:block">
              <AnalysisResult result={currentAnalysis} error={error} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Logs</h2>
              </div>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting Capture</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${currentAnalysis?.id === item.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setError(null);
                        initializeAudio();
                        speakText(item.explanation);
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black capitalize text-xs tracking-tight">{item.primaryEmotion}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${currentAnalysis?.id === item.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                            {item.intensity}/10
                          </span>
                        </div>
                        <p className={`text-[10px] line-clamp-1 italic ${currentAnalysis?.id === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          "{item.explanation}"
                        </p>
                      </div>
                      <svg className={`w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 ${currentAnalysis?.id === item.id ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Mentor AI Vision Engine
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
