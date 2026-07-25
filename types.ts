
export enum ServiceMode {
  CHAT = 'CHAT',
  GRAPHIC_DESIGN = 'GRAPHIC_DESIGN',
  WEB_DESIGN = 'WEB_DESIGN'
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  provider?: 'gemini' | 'groq';
  isEnvKey?: boolean;
  isBuiltIn?: boolean;
  isActive: boolean;
  status: 'untested' | 'valid' | 'invalid' | 'rate_limited';
  lastTested?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode: ServiceMode;
  imageUrl?: string;
  webPreview?: string;
  usedKeyName?: string;
}

export interface UserStats {
  graphicRequests: number;
  webRequests: number;
  lastReset: number;
}

export interface AdminSettings {
  adminPin: string;
  systemPrompt: string;
  avatarUrl: string;
  allowPublicRequests: boolean;
  graphicDailyLimit: number;
  webDailyLimit: number;
}

