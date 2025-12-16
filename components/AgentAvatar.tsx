import React from 'react';
import { AgentRole } from '../types';
import { AGENTS } from '../constants';
import { User, Cpu, Scale } from 'lucide-react';

interface AgentAvatarProps {
  role: AgentRole;
  size?: 'sm' | 'md' | 'lg';
  isSpeaking?: boolean;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ role, size = 'md', isSpeaking }) => {
  const config = AGENTS[role];
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 48
  };

  const Icon = role === AgentRole.JUDGE ? Scale : (role === AgentRole.PRO ? User : Cpu);

  return (
    <div className={`relative ${isSpeaking ? 'animate-pulse' : ''}`}>
      <div 
        className={`${sizeClasses[size]} ${config.avatarColor} rounded-full flex items-center justify-center text-white shadow-lg border-2 border-slate-700`}
      >
        <Icon size={iconSizes[size]} />
      </div>
      {isSpeaking && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
        </span>
      )}
    </div>
  );
};

export default AgentAvatar;