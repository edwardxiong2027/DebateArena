import { AgentRole, AgentConfig } from './types';

export const GEMINI_MODEL_FAST = 'gemini-2.5-flash';
export const GEMINI_MODEL_REASONING = 'gemini-2.5-flash'; // Using flash for speed in demo, could be pro

export const DEFAULT_TOPIC = "Artificial Intelligence should replace human teachers in high schools.";

export const AGENTS: Record<AgentRole, AgentConfig> = {
  [AgentRole.PRO]: {
    name: "Agent Pro",
    persona: "You are a passionate advocate for the topic. You rely on logic, future trends, and optimism. Your arguments are concise, punchy, and persuasive.",
    avatarColor: "bg-blue-500"
  },
  [AgentRole.CON]: {
    name: "Agent Con",
    persona: "You are a skeptical critic of the topic. You rely on historical precedence, caution, and human-centric values. Your arguments are critical, defensive, and sharp.",
    avatarColor: "bg-red-500"
  },
  [AgentRole.JUDGE]: {
    name: "The Arbiter",
    persona: "You are a neutral judge. You analyze arguments for logical fallacies, emotional appeal, and factual strength. You do not take sides personally, only evaluate the debate performance.",
    avatarColor: "bg-amber-500"
  }
};

export const JUDGE_VARIANTS = {
  BALANCED: {
    id: 'BALANCED',
    name: "The Arbiter",
    description: "Balanced evaluation of logic and rhetoric.",
    persona: "You are a neutral judge. You analyze arguments for logical fallacies, emotional appeal, and factual strength. You do not take sides personally, only evaluate the debate performance."
  },
  LOGIC: {
    id: 'LOGIC',
    name: "The Logician",
    description: "Prioritizes facts and structure over emotion.",
    persona: "You are a strictly logical judge. You care ONLY about valid premises, sound deductions, and evidence. Emotional appeals reduce your score. You reward structure, clarity, and facts over rhetoric or delivery."
  },
  PERSUASION: {
    id: 'PERSUASION',
    name: "The Orator",
    description: "Prioritizes storytelling and emotional impact.",
    persona: "You are a judge focused on rhetoric and impact. You reward compelling storytelling, emotional connection, and persuasive language. Dry facts without strong delivery are scored lower. You value how well the argument connects with an audience."
  }
};

export const SAMPLE_TOPICS = [
  "Social media does more harm than good for teenagers.",
  "Space exploration is a waste of money compared to solving Earth's problems.",
  "Universal Basic Income is necessary for the AI era.",
  "Remote work should be a legal right for all office workers.",
  "Nuclear energy is essential for a carbon-free future.",
  "Smartphone bans in schools improve student learning.",
  "AI art generators should be banned to protect human artists.",
  "The four-day work week increases productivity."
];