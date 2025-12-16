import React from 'react';
import { Message, AgentRole } from '../types';
import { AGENTS } from '../constants';
import AgentAvatar from './AgentAvatar';

interface DebateBubbleProps {
  message: Message;
  judgeName?: string;
}

const DebateBubble: React.FC<DebateBubbleProps> = ({ message, judgeName }) => {
  const isPro = message.role === AgentRole.PRO;
  const isJudge = message.role === AgentRole.JUDGE;
  const config = AGENTS[message.role];

  if (isJudge) {
    return (
      <div className="flex flex-col items-center justify-center my-6 opacity-90 animate-fade-in-up">
        <div className="bg-slate-800 border border-amber-500/30 text-amber-100 px-6 py-3 rounded-2xl shadow-lg max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AgentAvatar role={AgentRole.JUDGE} size="sm" />
            <span className="font-bold text-amber-500 text-sm uppercase tracking-wide">
              {judgeName || "Judge's Ruling"}
            </span>
          </div>
          <p className="italic text-slate-300">"{message.text}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isPro ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isPro ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className="flex-shrink-0 mt-1">
          <AgentAvatar role={message.role} size="md" />
        </div>
        
        <div className={`flex flex-col ${isPro ? 'items-start' : 'items-end'}`}>
          <span className="text-xs text-slate-400 mb-1 px-1 font-medium">{config.name}</span>
          <div 
            className={`px-5 py-4 rounded-2xl shadow-md text-sm md:text-base leading-relaxed
              ${isPro 
                ? 'bg-blue-900/40 text-blue-50 border border-blue-500/20 rounded-tl-none' 
                : 'bg-red-900/40 text-red-50 border border-red-500/20 rounded-tr-none'
              }
            `}
          >
            {message.isThinking ? (
              <div className="flex gap-1 h-5 items-center">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
              </div>
            ) : (
              message.text
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateBubble;