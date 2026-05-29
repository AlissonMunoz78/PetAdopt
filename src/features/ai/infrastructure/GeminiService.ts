/**
 * CAPA: Infrastructure
 * Servicio para integración con Google Gemini API
 */

import { GeminiMessage } from '../domain/entities/ChatMessage';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Eres un asistente veterinario virtual de PetAdopt. Solo respondes preguntas sobre salud, cuidados, alimentación y bienestar de mascotas. Responde siempre en español de forma clara y empática. Si la pregunta no es sobre mascotas, redirige amablemente al tema.`;

export class GeminiService {
  private conversationHistory: GeminiMessage[] = [];
  private readonly MAX_HISTORY = 10;

  async sendMessage(userMessage: string): Promise<string> {
    if (!API_KEY) {
      throw new Error('EXPO_PUBLIC_GEMINI_API_KEY no configurada');
    }

    // Agregar mensaje del usuario al historial
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Mantener solo los últimos MAX_HISTORY mensajes
    if (this.conversationHistory.length > this.MAX_HISTORY) {
      this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY);
    }

    try {
      const requestBody = {
        contents: this.conversationHistory,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `Error Gemini: ${response.status}`
        );
      }

      const data = await response.json();
      const assistantMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No pude generar una respuesta';

      // Agregar respuesta del asistente al historial
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: assistantMessage }],
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
