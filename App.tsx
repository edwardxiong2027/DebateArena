import React, { useState, useEffect, useRef } from 'react';
import { DebateState, AgentRole, Message, JudgeEvaluation, JudgeType } from './types';
import { DEFAULT_TOPIC, SAMPLE_TOPICS, JUDGE_VARIANTS } from './constants';
import { generateAgentResponse, generateJudgeEvaluation } from './services/geminiService';
import AgentAvatar from './components/AgentAvatar';
import DebateBubble from './components/DebateBubble';
import ScoreChart from './components/ScoreChart';
import ControlPanel from './components/ControlPanel';
import Logo from './components/Logo';
import { Trophy, BrainCircuit, Activity, Clock, Timer, CheckCircle, Flag, Hourglass } from 'lucide-react';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [state, setState] = useState<DebateState>({
    topic: DEFAULT_TOPIC,
    status: 'IDLE',
    round: 0,
    messages: [],
    evaluations: [],
    isThinking: false,
    currentSpeaker: null,
    totalTime: 0,
    turnTime: 0,
    maxRounds: 5,
    maxDuration: 600, // 10 minutes default
    maxTurnDuration: 60, // 60 seconds default
    judgeType: 'BALANCED'
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [state.messages, state.isThinking, state.status]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.status === 'ACTIVE') {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          totalTime: prev.totalTime + 1,
          turnTime: prev.turnTime + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.status]);

  // Debate Logic Loop
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const processDebateStep = async () => {
      if (state.status !== 'ACTIVE' || state.isThinking) return;

      setState(prev => ({ ...prev, isThinking: true }));

      try {
        // Determine who speaks next
        const lastMsg = state.messages[state.messages.length - 1];
        let nextRole: AgentRole = AgentRole.PRO;

        // Sequence: PRO -> CON -> JUDGE -> New Round -> PRO...
        if (lastMsg) {
          if (lastMsg.role === AgentRole.PRO) nextRole = AgentRole.CON;
          else if (lastMsg.role === AgentRole.CON) nextRole = AgentRole.JUDGE;
          else if (lastMsg.role === AgentRole.JUDGE) nextRole = AgentRole.PRO;
        }

        // Check limits before starting a new round or turn
        const isRoundLimitReached = state.maxRounds > 0 && state.round >= state.maxRounds;
        const isTimeLimitReached = state.maxDuration > 0 && state.totalTime >= state.maxDuration;
        
        // If we are about to start a NEW round (next is PRO), and limits are met, stop.
        if (nextRole === AgentRole.PRO && state.messages.length > 0) {
           if (isRoundLimitReached || isTimeLimitReached) {
             setState(prev => ({ ...prev, status: 'COMPLETED', isThinking: false, currentSpeaker: null }));
             return;
           }
        }

        // Reset turn timer when speaker changes
        setState(prev => ({ ...prev, currentSpeaker: nextRole, turnTime: 0 }));

        // Add "Thinking" placeholder
        const thinkingId = Date.now().toString();
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { id: thinkingId, role: nextRole, text: '', timestamp: Date.now(), isThinking: true }]
        }));

        if (nextRole === AgentRole.JUDGE) {
          // Judge Evaluation - Pass the selected persona
          const judgePersona = JUDGE_VARIANTS[state.judgeType].persona;
          const evaluation = await generateJudgeEvaluation(state.topic, state.messages, judgePersona);
          
          setState(prev => ({
            ...prev,
            round: prev.round + 1,
            evaluations: [...prev.evaluations, evaluation],
            messages: prev.messages.filter(m => m.id !== thinkingId).concat({
              id: Date.now().toString(),
              role: AgentRole.JUDGE,
              text: evaluation.reasoning,
              timestamp: Date.now()
            }),
            isThinking: false,
            currentSpeaker: null
          }));
        } else {
          // Agent Response
          const responseText = await generateAgentResponse(nextRole, state.topic, state.messages);
          
          setState(prev => ({
            ...prev,
            messages: prev.messages.filter(m => m.id !== thinkingId).concat({
              id: Date.now().toString(),
              role: nextRole,
              text: responseText,
              timestamp: Date.now()
            }),
            isThinking: false,
            currentSpeaker: null
          }));
        }

      } catch (error) {
        console.error("Debate Loop Error", error);
        setState(prev => ({ ...prev, status: 'PAUSED', isThinking: false }));
      }
    };

    if (state.status === 'ACTIVE') {
      // Add a small delay for readability between turns
      timeoutId = setTimeout(processDebateStep, 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [state.status, state.messages, state.topic, state.maxRounds, state.maxDuration, state.round, state.totalTime, state.judgeType]);

  // Handlers
  const handleStart = () => {
    if (state.status === 'PAUSED') {
      setState(prev => ({ ...prev, status: 'ACTIVE' }));
    } else {
      // New Game
      setState(prev => ({
        ...prev,
        status: 'ACTIVE',
        messages: [],
        evaluations: [],
        round: 0,
        totalTime: 0,
        turnTime: 0
      }));
    }
  };

  const handlePause = () => setState(prev => ({ ...prev, status: 'PAUSED' }));

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      topic: DEFAULT_TOPIC,
      status: 'IDLE',
      round: 0,
      messages: [],
      evaluations: [],
      isThinking: false,
      currentSpeaker: null,
      totalTime: 0,
      turnTime: 0
    }));
  };

  const handleTopicSelect = (t: string) => {
    if (state.status === 'IDLE') {
      setState(prev => ({ ...prev, topic: t }));
    }
  };

  // Derived state
  const lastEval = state.evaluations[state.evaluations.length - 1];
  const proScore = lastEval ? lastEval.proScore : 50;
  const conScore = lastEval ? lastEval.conScore : 50;
  const activeJudgeName = JUDGE_VARIANTS[state.judgeType].name;

  const getWinner = () => {
    if (!lastEval) return { text: "No Data", color: "text-slate-400" };
    if (lastEval.proScore > lastEval.conScore) return { text: "Agent Pro Wins", color: "text-blue-500", role: AgentRole.PRO };
    if (lastEval.conScore > lastEval.proScore) return { text: "Agent Con Wins", color: "text-red-500", role: AgentRole.CON };
    return { text: "It's a Tie", color: "text-amber-500", role: AgentRole.JUDGE };
  };
  const winner = getWinner();

  // Helper for Turn Timer Visual
  const timeLeft = Math.max(0, state.maxTurnDuration - state.turnTime);
  const timePercent = Math.min(100, (timeLeft / state.maxTurnDuration) * 100);
  const isTimeRunningOut = timeLeft <= 10;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Pro</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Con</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {activeJudgeName}</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* Left: Debate Chat Area */}
        <section className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Messages List */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 scroll-smooth"
          >
            {state.messages.length === 0 && state.status === 'IDLE' && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <BrainCircuit size={64} className="mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold mb-2">Ready to Debate</h3>
                <p className="max-w-md text-slate-400 mb-8">
                  Enter a topic below or select a sample to watch two AI agents debate in real-time.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                  {SAMPLE_TOPICS.map((t, i) => (
                    <button 
                      key={i}
                      onClick={() => handleTopicSelect(t)}
                      className="text-sm p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state.messages.map((msg) => (
              <DebateBubble 
                key={msg.id} 
                message={msg} 
                judgeName={activeJudgeName}
              />
            ))}

            {/* Debate Complete Card */}
            {state.status === 'COMPLETED' && (
              <div className="flex flex-col items-center justify-center my-8 animate-fade-in-up">
                <div className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                   {/* Confetti / Glow effect */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                   
                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 mb-4 shadow-inner">
                      <Flag size={32} className={winner.color} />
                   </div>
                   
                   <h2 className="text-2xl font-bold text-white mb-1">Debate Concluded</h2>
                   <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest">{state.round} Rounds • {formatTime(state.totalTime)}</p>
                   
                   <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-6">
                      <div className="text-xs text-slate-500 mb-1">FINAL VERDICT</div>
                      <div className={`text-xl font-bold ${winner.color}`}>{winner.text}</div>
                   </div>
                   
                   <button 
                     onClick={handleReset}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                   >
                     <CheckCircle size={18} /> Start New Debate
                   </button>
                </div>
              </div>
            )}
            
            {/* Bottom spacer */}
            <div className="h-4" />
          </div>

        </section>

        {/* Right: Analysis & Stats */}
        <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          
          {/* Live Scoreboard */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Activity size={16} /> Live Analysis
              </h2>
              <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono transition-colors ${state.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'text-slate-400 bg-slate-800'}`}>
                <Clock size={12} />
                {state.status === 'COMPLETED' ? 'FINAL' : formatTime(state.totalTime)}
              </div>
            </div>
            
            <div className="flex items-end justify-between mb-2">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{proScore}</div>
                <div className="text-xs text-slate-400">PRO</div>
              </div>
              <div className="text-center pb-1">
                <Trophy 
                  className={`w-6 h-6 ${proScore > conScore ? 'text-blue-500' : (conScore > proScore ? 'text-red-500' : 'text-slate-600')}`} 
                />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{conScore}</div>
                <div className="text-xs text-slate-400">CON</div>
              </div>
            </div>
            
            {/* Simple Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: `${proScore}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-1000" 
                style={{ width: `${100 - proScore}%` }} 
              />
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 p-4 flex flex-col min-h-[200px]">
            <h3 className="text-xs font-semibold text-slate-500 mb-2">MOMENTUM HISTORY</h3>
            <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
              <ScoreChart evaluations={state.evaluations} />
            </div>
          </div>

          {/* Judge's Latest Remark */}
          {lastEval && (
            <div className="p-4 bg-amber-900/10 border-t border-amber-900/20">
               <h3 className="text-xs font-semibold text-amber-500 mb-2 uppercase">{activeJudgeName}'s Note</h3>
               <p className="text-sm text-amber-100/80 italic leading-snug">
                 "{lastEval.reasoning}"
               </p>
            </div>
          )}

          {/* Agent Status */}
          <div className="p-4 border-t border-slate-800 grid grid-cols-2 gap-4">
             {/* PRO CARD */}
             <div className={`relative p-3 rounded-xl border-2 transition-all duration-500 overflow-hidden ${state.currentSpeaker === AgentRole.PRO ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-10' : 'bg-slate-800 border-slate-700 opacity-60 scale-100'}`}>
                {/* Visual Progress Bar Background for Active Speaker */}
                {state.currentSpeaker === AgentRole.PRO && (
                  <div 
                    className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-linear ${isTimeRunningOut ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}
                    style={{ width: `${timePercent}%` }}
                  />
                )}
                
                {state.currentSpeaker === AgentRole.PRO && (
                   <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm transition-colors duration-300 ${isTimeRunningOut ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
                     <Hourglass size={10} />
                     {timeLeft}s
                   </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <AgentAvatar role={AgentRole.PRO} size="sm" isSpeaking={state.currentSpeaker === AgentRole.PRO} />
                  <span className="text-xs font-bold text-slate-300">Agent Pro</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Focus: Optimism, Logic</div>
             </div>
             
             {/* CON CARD */}
             <div className={`relative p-3 rounded-xl border-2 transition-all duration-500 overflow-hidden ${state.currentSpeaker === AgentRole.CON ? 'bg-red-900/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105 z-10' : 'bg-slate-800 border-slate-700 opacity-60 scale-100'}`}>
                 {/* Visual Progress Bar Background for Active Speaker */}
                 {state.currentSpeaker === AgentRole.CON && (
                  <div 
                    className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-linear ${isTimeRunningOut ? 'bg-red-500 animate-pulse' : 'bg-red-500'}`}
                    style={{ width: `${timePercent}%` }}
                  />
                )}
                
                {state.currentSpeaker === AgentRole.CON && (
                   <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm transition-colors duration-300 ${isTimeRunningOut ? 'bg-red-600 text-white animate-pulse' : 'bg-red-600 text-white'}`}>
                     <Hourglass size={10} />
                     {timeLeft}s
                   </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <AgentAvatar role={AgentRole.CON} size="sm" isSpeaking={state.currentSpeaker === AgentRole.CON} />
                  <span className="text-xs font-bold text-slate-300">Agent Con</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Focus: Caution, History</div>
             </div>
          </div>

        </aside>
      </main>

      {/* Footer Controls */}
      <ControlPanel 
        topic={state.topic} 
        setTopic={(t) => setState(prev => ({...prev, topic: t}))}
        status={state.status}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        disabled={state.isThinking}
        maxRounds={state.maxRounds}
        setMaxRounds={(n) => setState(prev => ({...prev, maxRounds: n}))}
        maxDuration={state.maxDuration}
        setMaxDuration={(n) => setState(prev => ({...prev, maxDuration: n}))}
        maxTurnDuration={state.maxTurnDuration}
        setMaxTurnDuration={(n) => setState(prev => ({...prev, maxTurnDuration: n}))}
        judgeType={state.judgeType}
        setJudgeType={(t) => setState(prev => ({...prev, judgeType: t}))}
      />
    </div>
  );
};

export default App;