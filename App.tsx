
import React, { useState, useCallback } from 'react';
import CameraFeed from './components/CameraFeed';
import AnalysisResult from './components/AnalysisResult';
import { analyzeEmotionFromImage } from './services/geminiService';
import { EmotionAnalysis, AnalysisStatus } from './types';

const App: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [history, setHistory] = useState<EmotionAnalysis[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64Image: string) => {
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const result = await analyzeEmotionFromImage(base64Image);
      setCurrentAnalysis(result);
      if (result.isFaceDetected) {
        setHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10 detections
      }
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze expression. Please ensure you have a stable connection and try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">EmoLens AI</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Emotion Analysis Engine</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area: Camera & Primary Result */}
          <div className="lg:col-span-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Visual Input
                </h2>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></span>
                  LIVE STREAM
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

            {/* Application Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Privacy First', desc: 'Faces are processed for emotion only. No identity tracking.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { title: 'Real-time Analysis', desc: 'Gemini Vision processes visual cues in milliseconds.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'Respectful AI', desc: 'Insights are non-judgmental and supportive by design.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3 text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area: Analysis Result & History */}
          <div className="lg:col-span-4 space-y-8">
            <section className="hidden lg:block">
              <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Detailed Analysis</h2>
              <AnalysisResult result={currentAnalysis} error={error} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-800">Recent History</h2>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  SESSION ONLY
                </span>
              </div>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                    <p className="text-sm text-slate-400 font-medium italic">No recent captures</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-default group"
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setError(null);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 capitalize">{item.primaryEmotion}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">INTENSITY</span>
                          <span className="text-xs font-black text-indigo-600">{item.intensity}/10</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                        {item.explanation}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-300 font-medium">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} EmoLens AI. For entertainment and research purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
