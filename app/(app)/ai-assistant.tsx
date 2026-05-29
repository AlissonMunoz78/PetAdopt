/**
 * CAPA: Presentation
 * Pantalla de chat con asistente IA (Gemini)
 * Diseño refinado con animaciones y estilo premium
 */

import { useGeminiChat } from '@features/ai/presentation/hooks/useGeminiChat';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

const CORAL = '#A86A5A';
const TEAL = '#0F6966';
const LIGHT_GRAY = '#F0F4F8'; // Gris azulado más limpio
const USER_BUBBLE_COLOR = '#178A86'; // Un tono un poco más brillante para el usuario

// --- COMPONENTE ANIMADO DE PUNTOS SUSPENSIVOS ---
const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  const dotStyle = (dot: Animated.Value) => ({
    opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{
      translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] })
    }]
  });

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, dotStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, dotStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, dotStyle(dot3)]} />
    </View>
  );
};
// ------------------------------------------------

export default function AIAssistantScreen() {
  const { messages, isLoading, sendMessage, clearChat, quickSuggestions } = useGeminiChat();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [showSuggestions, setShowSuggestions] = useState(messages.length === 1 || messages.length === 0);

  // Scroll automático suave al último mensaje
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150); // Un poco más de delay para asegurar que el teclado subió
    }
  }, [messages, isLoading]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
      setShowSuggestions(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleClearChat = () => {
    clearChat();
    setShowSuggestions(true);
  };

  const renderMessage = ({ item }: { item: (typeof messages)[0] }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
        {!isUser && (
          <View style={styles.avatarAssistant}>
            {/* Usamos sparkles como icono representativo de la IA */}
            <IconSymbol name="sparkles" color="#FFF" size={14} /> 
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAssistant]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Premium */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconBox}>
            <IconSymbol name="sparkles" color={TEAL} size={16} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Asistente Veterinario</Text>
            <Text style={styles.headerSubtitle}>IA con tecnología Gemini</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton} activeOpacity={0.6}>
          <IconSymbol name="trash.circle.fill" color="#FF5252" size={26} />
        </TouchableOpacity>
      </View>

      {/* Lista de Mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          isLoading ? (
            <View style={styles.messageWrapper}>
              <View style={styles.avatarAssistant}>
                <IconSymbol name="sparkles" color="#FFF" size={14} />
              </View>
              <View style={[styles.messageBubble, styles.bubbleAssistant, { paddingVertical: 14 }]}>
                <TypingIndicator />
              </View>
            </View>
          ) : null
        )}
      />

      {/* Sugerencias Rápidas */}
      {showSuggestions && (
        <View style={styles.suggestionsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContent}>
            {quickSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleQuickSuggestion(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={[styles.inputContainer, inputText.trim() ? styles.inputContainerActive : null]}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu consulta aquí..."
            placeholderTextColor="#A0A0A0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            <View style={[styles.sendIconBox, { backgroundColor: inputText.trim() ? TEAL : '#E0E0E0' }]}>
              <IconSymbol name="arrow.up" color="#FFF" size={16} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFD', // Fondo ultra claro
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    backgroundColor: TEAL + '15', // Transparencia del 15%
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 12, color: TEAL, fontWeight: '600' },
  clearButton: { padding: 4 },

  // List
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // Messages
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  wrapperUser: { justifyContent: 'flex-end' },
  wrapperAssistant: { justifyContent: 'flex-start' },
  
  avatarAssistant: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: USER_BUBBLE_COLOR,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  textUser: { color: '#FFF' },
  textAssistant: { color: '#2C3E50' },

  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEAL,
  },

  // Suggestions
  suggestionsWrapper: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: TEAL + '40', // Borde sutil
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '600',
  },

  // Input
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: LIGHT_GRAY,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainerActive: {
    borderColor: TEAL + '40', // Se resalta sutilmente cuando escribes
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  sendIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});