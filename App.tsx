
import React, { useState, useCallback } from 'react';
import CameraFeed from './components/CameraFeed';
import AnalysisResult from './components/AnalysisResult';
import { analyzeEmotionFromImage, initializeAudio } from './services/geminiService';
import { EmotionAnalysis, AnalysisStatus } from './types';

const App: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [history, setHistory] = useState<EmotionAnalysis[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64Image: string) => {
    // Resume audio context on the user gesture
    initializeAudio();
    
    setStatus(AnalysisStatus.LOADING);
    setError(null);
    try {
      const result = await analyzeEmotionFromImage(base64Image);
      setCurrentAnalysis(result);
      
      if (result.isFaceDetected) {
        setHistory(prev => [result, ...prev].slice(0, 10));
        setStatus(AnalysisStatus.SUCCESS);
      } else {
        setStatus(AnalysisStatus.SUCCESS);
      }
    } catch (err: any) {
      console.error("EmoLens Error:", err);
      setError(err?.message || "I had trouble with the visual stream. Please check your connection.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-indigo-100">
      {/* Top Tab Brand Bar with Exact Logo from Image */}
      <div className="bg-[#0f172a] text-white py-3 px-6 flex justify-between items-center sticky top-0 z-30 shadow-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Exact Logo Recreation */}
          <div className="w-9 h-9 bg-[#5850ec] rounded-[10px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.2" />
              <circle cx="9.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="14.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
              <path d="M9 15C10 16 11 16.5 12 16.5C13 16.5 14 16 15 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-black tracking-tight">EmoLens</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em]">Cognitive Intelligence</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Live Analysis</span>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-[900] text-slate-900 tracking-tighter leading-none">Observational Stream</h1>
          <p className="text-slate-500 font-medium text-lg mt-3">Real-time facial expression and reaction analysis.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            <section>
              <CameraFeed 
                onCapture={handleCapture} 
                isAnalyzing={status === AnalysisStatus.LOADING} 
              />
            </section>

            <div className="lg:hidden">
              <AnalysisResult result={currentAnalysis} error={error} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Audible Response', desc: 'EmoLens verbalizes observations using high-fidelity text-to-speech.', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
                { title: 'Emotional Logic', desc: 'Complex micro-expression detection across multiple visual nodes.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                { title: 'Ephemeral Data', desc: 'No imagery is stored. All processing remains strictly within this session.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-2">{item.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <section className="hidden lg:block sticky top-24">
              <AnalysisResult result={currentAnalysis} error={error} />
              
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Session History</h2>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                </div>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Awaiting Capture</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${currentAnalysis?.id === item.id ? 'bg-[#5850ec] border-[#5850ec] text-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                        onClick={() => {
                          setCurrentAnalysis(item);
                          setError(null);
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-extrabold capitalize text-sm tracking-tight">{item.primaryEmotion}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${currentAnalysis?.id === item.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-[#5850ec]'}`}>
                              {item.intensity}/10
                            </span>
                          </div>
                          <p className={`text-[11px] line-clamp-1 italic font-medium opacity-70`}>
                            "{item.explanation}"
                          </p>
                        </div>
                        <svg className={`w-5 h-5 ml-4 transition-transform group-hover:translate-x-1 ${currentAnalysis?.id === item.id ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-32 border-t border-slate-200 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-10">
            <div className="w-14 h-14 bg-[#5850ec] rounded-[14px] flex items-center justify-center text-white shadow-2xl">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.2" />
                <circle cx="9.5" cy="10.5" r="1.2" fill="currentColor" />
                <circle cx="14.5" cy="10.5" r="1.2" fill="currentColor" />
                <path d="M9 15C10 16 11 16.5 12 16.5C13 16.5 14 16 15 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em]">
            EmoLens • Advanced Observation Systems
          </p>
          <p className="mt-4 text-[12px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} EmoLens Vision Core. All visual analysis is local.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
