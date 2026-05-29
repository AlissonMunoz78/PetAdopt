/**
 * CAPA: Presentation
 * Hook custom para gestionar chat con Gemini
 */

import { useState } from 'react';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { GeminiService } from '../../infrastructure/GeminiService';

const geminiService = new GeminiService();

const WELCOME_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content:
    '¡Hola! Soy el asistente veterinario de PetAdopt. Puedo ayudarte con preguntas sobre salud, cuidados, alimentación y bienestar de tus mascotas. ¿Qué necesitas saber hoy?',
  timestamp: Date.now(),
};

const QUICK_SUGGESTIONS = [
  '¿Qué vacunas necesita un perro?',
  '¿Cada cuánto bañar un gato?',
  '¿Qué alimentos son tóxicos para mascotas?',
];

export function useGeminiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Agregar mensaje del usuario al estado
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await geminiService.sendMessage(text);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      // Agregar mensaje de error como asistente
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${errorMessage}. Por favor, intenta de nuevo.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    geminiService.clearHistory();
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    quickSuggestions: QUICK_SUGGESTIONS,
  };
}
