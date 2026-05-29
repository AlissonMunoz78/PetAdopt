/**
 * CAPA: Domain
 * Entidades para chat de IA
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GeminiMessage {
  role: string;
  content: string;
}