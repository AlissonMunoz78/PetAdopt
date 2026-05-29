/**
 * CAPA: Infrastructure
 * Servicio para integración con Groq API
 */

import { GeminiMessage } from '../domain/entities/ChatMessage';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `Eres un asistente veterinario virtual de PetAdopt. Solo respondes preguntas sobre salud, cuidados, alimentación y bienestar de mascotas. Responde siempre en español de forma clara y empática. Si la pregunta no es sobre mascotas, redirige amablemente al tema.`;

export class GeminiService {
  private conversationHistory: GeminiMessage[] = [];
  private readonly MAX_HISTORY = 10;

  async sendMessage(userMessage: string): Promise<string> {
    if (!API_KEY) {
      throw new Error('EXPO_PUBLIC_GEMINI_API_KEY no configurada');
    }

    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    if (this.conversationHistory.length > this.MAX_HISTORY) {
      this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...this.conversationHistory,
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(errorData.error?.message || `Error Groq: ${response.status}`);
      }

      const data = await response.json() as any;
      const assistantMessage = data.choices[0].message.content;

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      return assistantMessage;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al conectar con Gemini: ${message}`);
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): GeminiMessage[] {
    return [...this.conversationHistory];
  }
}