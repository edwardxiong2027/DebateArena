export enum AgentRole {
  PRO = 'PRO',
  CON = 'CON',
  JUDGE = 'JUDGE'
}

export interface Message {
  id: string;
  role: AgentRole;
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface JudgeEvaluation {
  proScore: number;
  conScore: number;
  reasoning: string;
  winningSide: 'PRO' | 'CON' | 'TIE';
}

export type JudgeType = 'BALANCED' | 'LOGIC' | 'PERSUASION';

export interface DebateState {
  topic: string;
  status: 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  round: number;
  messages: Message[];
  evaluations: JudgeEvaluation[];
  isThinking: boolean;
  currentSpeaker: AgentRole | null;
  totalTime: number;
  turnTime: number;
  maxRounds: number;
  maxDuration: number; // in seconds
  maxTurnDuration: number; // in seconds
  judgeType: JudgeType;
}

export interface AgentConfig {
  name: string;
  persona: string;
  avatarColor: string;
}