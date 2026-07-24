
export enum ServiceMode {
  CHAT = 'CHAT',
  GRAPHIC_DESIGN = 'GRAPHIC_DESIGN',
  WEB_DESIGN = 'WEB_DESIGN'
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  isEnvKey?: boolean;
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

