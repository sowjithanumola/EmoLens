
import React, { useState, useCallback } from 'react';
import CameraFeed from './components/CameraFeed';
import AnalysisResult from './components/AnalysisResult';
import { analyzeEmotionFromImage, speakText } from './services/geminiService';
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
        setHistory(prev => [result, ...prev].slice(0, 10));
        // Status SUCCESS should happen while speaking or right before
        setStatus(AnalysisStatus.SUCCESS);
        // Automatically speak the analysis
        await speakText(result.explanation);
      } else {
        setStatus(AnalysisStatus.SUCCESS);
      }
      
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("I had trouble interpreting that frame. Please check your internet connection.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
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
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Emotion Analysis AI</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Voice Processor Online</span>
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
                  Ready to Capture
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
                { title: 'Interactive TTS', desc: 'I speak my observations out loud to you using high-fidelity synthesis.', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
                { title: 'Reaction Logic', desc: 'My reasoning engine detects subtle micro-expressions in real-time.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                { title: 'Private & Safe', desc: 'I do not identify individuals. I only interpret universal emotional cues.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{item.title}</h4>
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
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Logs</h2>
              </div>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Captures Yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${currentAnalysis?.id === item.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setError(null);
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
                          {item.explanation}
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
          <div className="flex justify-center gap-4 mb-4">
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
             </div>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} EmoLens AI Observation Engine
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
