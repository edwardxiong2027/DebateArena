import React from 'react';
import { MessageSquare, Zap } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon Graphic */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full animate-pulse"></div>
        
        {/* Pro Bubble (Blue, Flipped) */}
        <div className="absolute -left-1 -top-1 text-blue-500 transform -scale-x-100 opacity-90">
           <MessageSquare size={26} fill="currentColor" fillOpacity={0.15} strokeWidth={2.5} />
        </div>
        
        {/* Con Bubble (Red) */}
        <div className="absolute -right-1 -bottom-1 text-red-500 opacity-90">
           <MessageSquare size={26} fill="currentColor" fillOpacity={0.15} strokeWidth={2.5} />
        </div>

        {/* Central Spark (Energy) */}
        <div className="absolute z-10 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
           <Zap size={18} fill="currentColor" />
        </div>
      </div>
      
      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
           <span className="text-2xl font-bold text-slate-100 tracking-tight">Debate</span>
           <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">Arena</span>
           <sup className="ml-1 text-[10px] font-bold text-indigo-400 tracking-widest opacity-80">AI</sup>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[2px] w-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
          <p className="text-[10px] font-semibold text-slate-500 tracking-[0.2em] uppercase">Cognitive Battleground</p>
          <div className="h-[2px] w-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default Logo;