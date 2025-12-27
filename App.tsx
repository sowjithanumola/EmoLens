
import React, { useState, useCallback, useEffect } from 'react';
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
    // Attempt to unlock audio context on first user interaction
    initializeAudio();
    
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const result = await analyzeEmotionFromImage(base64Image);
      setCurrentAnalysis(result);
      
      if (result.isFaceDetected) {
        setHistory(prev => [result, ...prev].slice(0, 10));
        setStatus(AnalysisStatus.SUCCESS);
        await speakText(result.explanation);
      } else {
        setStatus(AnalysisStatus.SUCCESS);
      }
      
    } catch (err: any) {
      console.error("App Capture Error:", err);
      setError(err?.message || "I encountered an error while trying to look at you. Please try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Mentor AI Branding Tab */}
      <div className="bg-[#4f46e5] h-1.5 w-full sticky top-0 z-50"></div>
      <div className="bg-white border-b border-slate-200 sticky top-1.5 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mentor AI Icon Block */}
            <div className="w-10 h-10 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Mentor AI</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Emotion Analysis Engine</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 cursor-default">Dashboard</span>
              <span className="text-xs font-black text-indigo-600 border-b-2 border-indigo-600 pb-1 cursor-default">Vision Stream</span>
            </nav>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">System Live</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Visual Input Stream
                </h2>
              </div>
              <CameraFeed 
                onCapture={handleCapture} 
                isAnalyzing={status === AnalysisStatus.LOADING} 
              />
            </section>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Audio Feedback', desc: 'Hear observations in real-time with our low-latency speech synthesis.', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
                { title: 'Mentor AI Intelligence', desc: 'Leveraging world-class vision models for high-precision emotional detection.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                { title: 'Privacy Focused', desc: 'Processing happens in real-time; facial data is never stored locally or remotely.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section>
              <AnalysisResult result={currentAnalysis} error={error} />
            </section>

            <section>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Recent Observations</h2>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting Capture</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${currentAnalysis?.id === item.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setError(null);
                        speakText(item.explanation);
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black capitalize text-xs">{item.primaryEmotion}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${currentAnalysis?.id === item.id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                            {item.intensity}/10
                          </span>
                        </div>
                        <p className={`text-[10px] line-clamp-1 italic ${currentAnalysis?.id === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          "{item.explanation}"
                        </p>
                      </div>
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
            &copy; {new Date().getFullYear()} Mentor AI Vision Core
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
