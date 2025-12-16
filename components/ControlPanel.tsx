import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Sparkles, ChevronUp, Settings, Clock, Layers, Hourglass, Scale } from 'lucide-react';
import { SAMPLE_TOPICS, JUDGE_VARIANTS } from '../constants';
import { JudgeType } from '../types';

interface ControlPanelProps {
  topic: string;
  setTopic: (t: string) => void;
  status: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled: boolean;
  maxRounds: number;
  setMaxRounds: (n: number) => void;
  maxDuration: number;
  setMaxDuration: (n: number) => void;
  maxTurnDuration: number;
  setMaxTurnDuration: (n: number) => void;
  judgeType: JudgeType;
  setJudgeType: (t: JudgeType) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  topic,
  setTopic,
  status,
  onStart,
  onPause,
  onReset,
  disabled,
  maxRounds,
  setMaxRounds,
  maxDuration,
  setMaxDuration,
  maxTurnDuration,
  setMaxTurnDuration,
  judgeType,
  setJudgeType
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Helper to format seconds to minutes for display
  const durationOptions = [
    { label: '2 Minutes', value: 120 },
    { label: '5 Minutes', value: 300 },
    { label: '10 Minutes', value: 600 },
    { label: '20 Minutes', value: 1200 },
    { label: 'Unlimited', value: 0 },
  ];

  const turnDurationOptions = [
    { label: '30 Seconds', value: 30 },
    { label: '45 Seconds', value: 45 },
    { label: '60 Seconds', value: 60 },
    { label: '90 Seconds', value: 90 },
  ];

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4 md:p-6 sticky bottom-0 z-10 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center">
        
        {/* Settings Toggle (Left on Desktop) */}
        <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              disabled={status !== 'IDLE'}
              className={`p-3 rounded-xl transition-colors ${
                showSettings 
                  ? 'bg-slate-700 text-indigo-400' 
                  : 'bg-slate-900 text-slate-400 hover:text-indigo-400 hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Debate Settings"
            >
              <Settings size={20} />
            </button>

            {/* Settings Popover */}
            {showSettings && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setShowSettings(false)} />
                <div className="absolute bottom-full left-0 mb-3 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 z-10 animate-[fade-in_0.2s_ease-out]">
                   <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Settings size={14} /> Configuration
                   </h3>

                   {/* Judge Selection */}
                   <div className="mb-4">
                     <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                       <Scale size={12} /> Judge Persona
                     </label>
                     <select 
                       value={judgeType}
                       onChange={(e) => setJudgeType(e.target.value as JudgeType)}
                       className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                     >
                        {Object.values(JUDGE_VARIANTS).map(variant => (
                          <option key={variant.id} value={variant.id}>{variant.name}</option>
                        ))}
                     </select>
                     <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                       {JUDGE_VARIANTS[judgeType].description}
                     </p>
                   </div>
                   
                   <hr className="border-slate-700 mb-4" />

                   {/* Max Rounds */}
                   <div className="mb-4">
                     <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                       <Layers size={12} /> Max Rounds
                     </label>
                     <div className="flex items-center gap-2">
                       <input 
                         type="range" 
                         min="1" 
                         max="20" 
                         value={maxRounds === 0 ? 20 : maxRounds} 
                         onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                         className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                       />
                       <span className="text-sm font-mono text-indigo-400 w-12 text-right">
                         {maxRounds === 0 ? '∞' : maxRounds}
                       </span>
                     </div>
                   </div>

                   {/* Max Duration */}
                   <div className="mb-4">
                     <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                       <Clock size={12} /> Total Time Limit
                     </label>
                     <select 
                       value={maxDuration}
                       onChange={(e) => setMaxDuration(Number(e.target.value))}
                       className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                     >
                        {durationOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                     </select>
                   </div>

                   {/* Turn Duration */}
                   <div>
                     <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                       <Hourglass size={12} /> Turn Duration (Target)
                     </label>
                     <select 
                       value={maxTurnDuration}
                       onChange={(e) => setMaxTurnDuration(Number(e.target.value))}
                       className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                     >
                        {turnDurationOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                     </select>
                   </div>
                </div>
              </>
            )}
        </div>

        {/* Topic Input Wrapper */}
        <div className="flex-1 w-full relative">
          
          {/* Suggestions Drop-up Menu */}
          {showSuggestions && (
            <>
              {/* Backdrop to close on click outside */}
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowSuggestions(false)} 
              />
              <div className="absolute bottom-full left-0 w-full mb-3 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-10 animate-[fade-in_0.2s_ease-out]">
                <div className="bg-slate-900/80 backdrop-blur px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} /> Suggested Topics
                  </span>
                  <ChevronUp size={14} className="text-slate-500" />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {SAMPLE_TOPICS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTopic(t);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-indigo-600/20 hover:text-indigo-200 transition-colors border-b border-slate-700/50 last:border-0"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="relative group">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={status !== 'IDLE'}
              placeholder="Enter a topic for debate..."
              className="w-full bg-slate-900 text-slate-100 border border-slate-600 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              disabled={status !== 'IDLE'}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                showSuggestions 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Suggest Topics"
            >
              <Sparkles size={18} />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 w-full md:w-auto justify-center">
          {status === 'IDLE' || status === 'PAUSED' ? (
            <button
              onClick={onStart}
              disabled={disabled || !topic.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Play size={18} fill="currentColor" />
              {status === 'PAUSED' ? 'Resume' : 'Start Debate'}
            </button>
          ) : (
            <button
              onClick={onPause}
              disabled={status === 'COMPLETED'}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Pause size={18} fill="currentColor" />
              Pause
            </button>
          )}

          <button
            onClick={onReset}
            disabled={status === 'IDLE'}
            className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;