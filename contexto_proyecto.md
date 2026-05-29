# Contexto Completo del Proyecto CV-CREATOR-APP


================================================
📄 ARCHIVO: .claude\settings.json
================================================

{
  "enabledPlugins": {
    "expo@claude-plugins-official": true
  }
}


================================================
📄 ARCHIVO: .env.d.ts
================================================

declare const process: {
  env: {
    readonly EXPO_PUBLIC_SUPABASE_URL: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly [key: string]: string | undefined;
  };
};

================================================
📄 ARCHIVO: .env.example
================================================

# ── Supabase ─────────────────────────────────────────────────────────────────
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# ── Google OAuth (para el botón "Iniciar con Google") ────────────────────────
# Obtener en: https://console.cloud.google.com → APIs → Credentials
# Agregar en Supabase: Authentication → Providers → Google
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=

# ── Google Gemini (para el asistente veterinario IA) ───────────────────────
# Obtener API key gratis en: https://aistudio.google.com/apikey
EXPO_PUBLIC_GEMINI_API_KEY=

# ── Google Maps (para el mapa) ───────────────────────────────────────────────
# Obtener en: https://console.cloud.google.com → Maps SDK
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# ── Sitio auxiliar de autenticación ─────────────────────────────────────────
# URL pública donde se despliega el sitio web auxiliar para confirmación y reset
EXPO_PUBLIC_AUTH_WEB_URL=

# ── Appwrite (migración Video 2) ─────────────────────────────────────────────
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=
EXPO_PUBLIC_APPWRITE_DB_ID=


================================================
📄 ARCHIVO: .gitignore
================================================

# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

app-example

# generated native folders
/ios
/android
.env.local
.env

================================================
📄 ARCHIVO: AGENTS.md
================================================

# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.


================================================
📄 ARCHIVO: app\(app)\ai-assistant.tsx
================================================

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

================================================
📄 ARCHIVO: app\(app)\index.tsx
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { PetSize, PetSpecies } from '@features/pets/domain/entities/Pet';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

// 🎨 Paleta de colores inspirada en tu imagen de referencia
const PALETTE = {
  primaryDark: "#056A55",   // Verde oscuro (Botones activos, textos principales)
  primaryLight: "#1DD3B0",  // Verde agua/Turquesa claro (Tags, botones inactivos)
  pillBg: "#E8F7F5",        // Fondo para píldoras inactivas
  coralRed: "#F28482",      // Rojo/Coral para tags o corazones
  white: "#FFFFFF",
  bgLight: "#F8F9FA",       // Fondo general clarito
  textDark: "#2B2D42",      // Gris muy oscuro para textos
  textGray: "#8D99AE",      // Gris para subtextos
};

// Adaptamos las opciones para que se vean como las píldoras de la imagen
const SPECIES_OPTIONS: { label: string; value: PetSpecies | null }[] = [
  { label: 'Todas', value: null },
  { label: 'Perros', value: 'dog' },
  { label: 'Gatos', value: 'cat' },
  { label: 'Aves', value: 'bird' },
  { label: 'Otros', value: 'other' },
];

export default function PetsListScreen() {
  const { availablePets, isLoadingAvailable, searchPets, searchResults } = usePets();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<PetSpecies | null>(null);

  const isShelter = user?.role === 'shelter';
  const pets = searchResults.length > 0 ? searchResults : availablePets;

  const handleSearch = async (speciesVal?: PetSpecies | null) => {
    const activeSpecies = speciesVal !== undefined ? speciesVal : filterSpecies;
    await searchPets({
      searchText: searchText || undefined,
      species: activeSpecies || undefined,
    });
  };

  const onSelectCategory = (value: PetSpecies | null) => {
    setFilterSpecies(value);
    handleSearch(value);
  };

  const renderPetItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.9}
    >
      {/* Zona de la Imagen (Ocupa la mitad superior) */}
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.petImage} resizeMode="cover" />
        ) : (
          <View style={[styles.petImage, styles.imagePlaceholder]}>
            <IconSymbol name="photo.fill" color={PALETTE.textGray} size={40} />
          </View>
        )}

        {/* Botón de Favorito / Corazón flotante */}
        <TouchableOpacity style={styles.heartButton} activeOpacity={0.7}>
          <IconSymbol name="heart" color={PALETTE.textDark} size={20} />
        </TouchableOpacity>

        {/* Etiquetas superpuestas (Tags estilo "VACUNADO") */}
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: PALETTE.primaryLight }]}>
            <Text style={styles.tagText}>{item.size?.toUpperCase() || 'MEDIANO'}</Text>
          </View>
          {(item.ageMonths < 6 && item.ageYears === 0) && (
            <View style={[styles.tag, { backgroundColor: PALETTE.coralRed }]}>
              <Text style={styles.tagText}>CACHORRO</Text>
            </View>
          )}
        </View>
      </View>

      {/* Zona de Información (Blanca) */}
      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
          {/* Distancia simulada o real */}
          <View style={styles.locationRow}>
            <IconSymbol name="mappin.and.ellipse" color={PALETTE.primaryDark} size={14} />
            <Text style={styles.distanceText}>a 2.5 km</Text>
          </View>
        </View>

        <View style={styles.infoFooter}>
          <Text style={styles.petBreed} numberOfLines={1}>
            {item.breed || 'Mestizo'} • {item.ageYears ? `${item.ageYears} años` : `${item.ageMonths} meses`}
          </Text>
          <Text style={styles.cityText}>Ciudad</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" color={PALETTE.textGray} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por raza o nombre..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={PALETTE.textGray}
            onSubmitEditing={() => handleSearch()}
          />
        </View>
      </View>

      {/* Píldoras de Categorías (Scroll Horizontal) */}
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesContainer}
        >
          {SPECIES_OPTIONS.map((opt) => {
            const isActive = filterSpecies === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.categoryPill,
                  isActive ? styles.categoryPillActive : styles.categoryPillInactive
                ]}
                onPress={() => onSelectCategory(opt.value)}
              >
                <Text style={[
                  styles.categoryText,
                  isActive ? styles.categoryTextActive : styles.categoryTextInactive
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Título de Sección */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recién Llegados</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mascotas */}
      {isLoadingAvailable ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PALETTE.primaryDark} />
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No encontramos mascotas</Text>
          <Text style={styles.emptySubtitle}>Intenta con otra búsqueda o categoría.</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          renderItem={renderPetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Opcional: Botón Flotante para Refugios (como la estrellita de la imagen) */}
      {isShelter && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/pets/my-pets/create')}>
          <IconSymbol name="plus" color={PALETTE.white} size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: PALETTE.bgLight 
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.white,
    borderRadius: 24, // Muy redondeado
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: PALETTE.textDark,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: PALETTE.primaryDark,
  },
  categoryPillInactive: {
    backgroundColor: PALETTE.pillBg,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: PALETTE.white,
  },
  categoryTextInactive: {
    color: PALETTE.primaryDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.textDark,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.primaryDark,
  },
  listContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 80, // Espacio extra abajo para el FAB
    gap: 20 
  },
  petCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    overflow: 'hidden', // Importante para que la imagen respete los bordes de la tarjeta
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 220, // Imagen grande como en la referencia
    position: 'relative',
  },
  petImage: { 
    width: '100%', 
    height: '100%', 
  },
  imagePlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tagsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.white,
    letterSpacing: 0.5,
  },
  infoContainer: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: PALETTE.textDark,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.primaryDark,
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petBreed: { 
    fontSize: 14, 
    color: PALETTE.textGray, 
    fontWeight: '500',
  },
  cityText: {
    fontSize: 13,
    color: PALETTE.textGray,
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '800',
    color: PALETTE.textDark, 
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: PALETTE.textGray,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }
});

================================================
📄 ARCHIVO: app\(app)\pets\adoption-requests\index.tsx
================================================

import { useAdoptionRequests } from '@features/adoptionRequests/presentation/hooks/useAdoptionRequests';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useState } from 'react';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '../../../../components/ui/icon-symbol';

// 🎨 Paleta extraída directamente de tu imagen de referencia
const PALETTE = {
  primaryDark: "#006B54",   // Verde oscuro sólido (Botón Aceptar)
  primaryLight: "#D9EBE6",  // Verde pastel (Píldoras/Tags)
  primaryText: "#185045",   // Verde texto oscuro (Texto en píldoras)
  dangerOutline: "#8D273A", // Rojo oscuro (Borde y texto Rechazar)
  white: "#FFFFFF",
  bgLight: "#FAFAFC",       // Fondo general sutil
  textDark: "#1A1A1A",      // Texto principal
  textGray: "#6B7280",      // Texto secundario
  border: "#E5E7EB",
  avatarBg: "#E0F2FE",      // Fondo celestito del avatar
  avatarIcon: "#0369A1",    // Icono azul oscuro del avatar
};

export default function AdoptionRequestsScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    adopterRequests,
    shelterRequests,
    isLoadingAdopterRequests,
    isLoadingShelterRequests,
    updateRequest,
    updateError,
    isUpdating,
    cancelRequest,
    isCancelling,
  } = useAdoptionRequests();

  const { shelterPets, availablePets } = usePets();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const isShelter = user?.role === 'shelter';
  const requests = isShelter ? shelterRequests : adopterRequests;
  const isLoading = isShelter ? isLoadingShelterRequests : isLoadingAdopterRequests;

  const handleApprove = (requestId: string) => {
    Alert.alert('Aprobar solicitud', '¿Confirmas que deseas aceptar a este adoptante?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        style: 'default',
        onPress: () => {
          updateRequest({
            requestId,
            input: { status: 'approved' },
          });
        },
      },
    ]);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (selectedRequest) {
      updateRequest({
        requestId: selectedRequest.id,
        input: { status: 'rejected', rejectionReason: rejectionReason || undefined },
      });
      setShowRejectModal(false);
      setSelectedRequest(null);
    }
  };

  const handleCancel = (requestId: string) => {
    Alert.alert('Cancelar solicitud', '¿Estás seguro de que deseas cancelar tu solicitud?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => {
          cancelRequest(requestId);
        },
      },
    ]);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En Revisión';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    // 👉 NUEVA LÓGICA: Unimos todas las mascotas y buscamos la que coincide con la solicitud
    const allPets = [...shelterPets, ...availablePets];
    // Soporta petId (camelCase) o pet_id (snake_case) dependiendo de tu backend
    const petId = item.petId || item.pet_id; 
    const foundPet = allPets.find(p => p.id === petId) || item.pet;

    // Extraemos los datos de la mascota encontrada
    const petName = foundPet?.name || 'Peludito';
    // Revisamos tanto imageUrl como image_url por si acaso
    const petImage = foundPet?.imageUrl || foundPet?.image_url; 
    
    const personName = isShelter 
        ? (item.adopter?.name || 'Familia Adoptante') 
        : (item.shelter?.name || 'Refugio');
    const personLevel = item.adopter?.experienceLevel || 'Principiante';

    return (
      <View style={styles.card}>
        {/* Mitad Superior: Foto de la Mascota */}
        <View style={styles.imageContainer}>
          {petImage ? (
            <Image source={{ uri: petImage }} style={styles.petImage} resizeMode="cover" />
          ) : (
            <View style={[styles.petImage, styles.imagePlaceholder]}>
              <IconSymbol name="pawprint.fill" color={PALETTE.textGray} size={40} />
            </View>
          )}
          
          {/* Badge del nombre de la mascota flotando sobre la imagen */}
          <View style={styles.petNameBadge}>
            <Text style={styles.petNameBadgeText}>{petName}</Text>
          </View>
          
          {/* Badge de estado en la esquina superior derecha */}
          {item.status !== 'pending' && (
            <View style={[styles.statusBadgeOverlay, item.status === 'approved' ? styles.statusApproved : styles.statusRejected]}>
              <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
            </View>
          )}
        </View>

        {/* Mitad Inferior: Contenido Blanco */}
        <View style={styles.cardContent}>
          
          {/* Header de la Info (Nombre y Avatar) */}
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoLeft}>
              <Text style={styles.personName} numberOfLines={1}>{personName}</Text>
              {isShelter && (
                <View style={styles.levelRow}>
                  <IconSymbol name="star" color={PALETTE.textDark} size={12} />
                  <Text style={styles.levelText}>Nivel: {personLevel}</Text>
                </View>
              )}
              {!isShelter && (
                <View style={styles.levelRow}>
                  <IconSymbol name="calendar" color={PALETTE.textGray} size={12} />
                  <Text style={styles.levelText}>
                    Enviada el {new Date(item.createdAt).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.avatarCircle}>
              <IconSymbol name="person.fill" color={PALETTE.avatarIcon} size={20} />
            </View>
          </View>

          {/* Tags / Atributos (Simulados basados en tu imagen) */}
          {isShelter && (
            <View style={styles.tagsRow}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>Casa con jardín</Text>
              </View>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>Sin otras mascotas</Text>
              </View>
            </View>
          )}

          {/* Mensaje del adoptante si existe */}
          {item.message && (
             <Text style={styles.requestMessage} numberOfLines={2}>"{item.message}"</Text>
          )}

          {/* Razón de rechazo si existe */}
          {item.rejectionReason && (
            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionTitle}>Motivo del rechazo:</Text>
              <Text style={styles.rejectionReason}>{item.rejectionReason}</Text>
            </View>
          )}

          {/* Botones de Acción: Refugio */}
          {isShelter && item.status === 'pending' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnAccept]}
                onPress={() => handleApprove(item.id)}
                disabled={isUpdating}
              >
                <Text style={styles.btnAcceptText}>Aceptar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.btnAction, styles.btnReject]}
                onPress={() => handleReject(item)}
                disabled={isUpdating}
              >
                <Text style={styles.btnRejectText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botones de Acción: Adoptante */}
          {!isShelter && item.status === 'pending' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnReject, { flex: 1, marginTop: 10 }]}
                onPress={() => handleCancel(item.id)}
                disabled={isCancelling}
              >
                <Text style={styles.btnRejectText}>Cancelar Solicitud</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Estilo Texto Limpio */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          {isShelter ? 'Solicitudes Recibidas' : 'Mis Solicitudes'}
        </Text>
        <Text style={styles.screenSubtitle}>
          {isShelter 
            ? 'Gestiona los nuevos hogares para tus rescatados.' 
            : 'Sigue el estado de tus solicitudes de adopción.'}
        </Text>
      </View>

      {/* Lista de Solicitudes */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PALETTE.primaryDark} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {isShelter ? 'No hay solicitudes nuevas' : 'Aún no has enviado solicitudes'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Rechazo (Manteniendo consistencia visual) */}
      <Modal visible={showRejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Rechazar solicitud</Text>
            <Text style={styles.modalSubtitle}>
              Puedes dejar un mensaje al adoptante explicando el motivo (opcional).
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ej: La mascota ya fue adoptada por otra familia..."
              placeholderTextColor={PALETTE.textGray}
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnReject]}
                onPress={() => setShowRejectModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.btnRejectText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnAccept]}
                onPress={handleConfirmReject}
                disabled={isUpdating}
              >
                <Text style={styles.btnAcceptText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: PALETTE.bgLight 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: PALETTE.bgLight,
  },
  screenTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: PALETTE.textDark,
    marginBottom: 6,
  },
  screenSubtitle: { 
    fontSize: 14, 
    color: PALETTE.textGray, 
    lineHeight: 20,
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    gap: 20 
  },
  // --- CARD STYLES ---
  card: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petNameBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: PALETTE.white,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petNameBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.primaryDark,
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusApproved: { backgroundColor: PALETTE.primaryDark },
  statusRejected: { backgroundColor: PALETTE.dangerOutline },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.white,
  },
  cardContent: {
    padding: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.textDark,
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 13,
    color: PALETTE.textDark,
    fontWeight: '500',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: PALETTE.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.primaryText,
  },
  requestMessage: {
    fontSize: 14,
    color: PALETTE.textGray,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  rejectionBox: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.dangerOutline,
    marginBottom: 2,
  },
  rejectionReason: {
    fontSize: 13,
    color: PALETTE.dangerOutline,
  },
  // --- ACTIONS ROW ---
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccept: {
    backgroundColor: PALETTE.primaryDark,
  },
  btnAcceptText: {
    color: PALETTE.white,
    fontSize: 15,
    fontWeight: '700',
  },
  btnReject: {
    backgroundColor: PALETTE.white,
    borderWidth: 1.5,
    borderColor: PALETTE.dangerOutline,
  },
  btnRejectText: {
    color: PALETTE.dangerOutline,
    fontSize: 15,
    fontWeight: '700',
  },
  // --- EMPTY STATE & MODAL ---
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 30 
  },
  emptyTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: PALETTE.textGray, 
    textAlign: 'center' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: PALETTE.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: PALETTE.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: PALETTE.textDark, 
    marginBottom: 8 
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: PALETTE.textGray, 
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: PALETTE.bgLight,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: PALETTE.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
});

================================================
📄 ARCHIVO: app\(app)\pets\my-pets\create.tsx
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { HealthStatus, PetSize, PetSpecies } from '@features/pets/domain/entities/Pet';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '../../../../components/ui/icon-symbol';

// 🎨 Paleta de colores "Pet & Nature" alineada a tu nuevo diseño
const PALETTE = {
  primaryDark: "#056A55",   // Verde oscuro principal (Botones, íconos, texto destacado)
  primaryLight: "#1DD3B0",  // Verde agua/Turquesa
  inputBg: "#EEF2F6",       // Fondo suave para inputs (como en la imagen)
  pillBg: "#E8F7F5",        // Fondo suave para píldoras
  white: "#FFFFFF",
  bgLight: "#FAFAFA",       // Fondo general
  textDark: "#2B2D42",      // Texto principal
  textGray: "#64748B",      // Texto secundario (etiquetas, placeholders)
  border: "#E2E8F0",
};

const SPECIES_OPTIONS: { label: string; value: PetSpecies }[] = [
  { label: 'Perro', value: 'dog' },
  { label: 'Gato', value: 'cat' },
  { label: 'Conejo', value: 'rabbit' },
  { label: 'Ave', value: 'bird' },
  { label: 'Otro', value: 'other' },
];

const SIZE_OPTIONS: { label: string; value: PetSize }[] = [
  { label: 'P', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'G', value: 'large' },
  { label: 'XG', value: 'xlarge' },
];

const HEALTH_OPTIONS: { label: string; value: HealthStatus }[] = [
  { label: 'Saludable', value: 'healthy' },
  { label: 'Atención Médica', value: 'medical_attention' },
  { label: 'Vacunado', value: 'vaccinated' },
];

export default function CreatePetScreen() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { createPetAsync, isCreating, updatePetAsync, isUpdating } = usePets();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [size, setSize] = useState<PetSize>('medium');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [temperament, setTemperament] = useState('');
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('healthy');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  const isLoading = isCreating || isUpdating;
  const isEditing = !!petId;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Faltan datos', 'El nombre de la mascota es requerido');
      return;
    }

    try {
      const input = {
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        ageYears: ageYears ? parseInt(ageYears) : undefined,
        ageMonths: ageMonths ? parseInt(ageMonths) : undefined,
        size,
        weightKg: weight ? parseFloat(weight) : undefined,
        description: description.trim() || undefined,
        temperament: temperament.trim() || undefined,
        healthStatus,
        imageUri: imageUri || undefined,
      };

      if (isEditing) {
        await updatePetAsync({
          petId: petId as string,
          input: { ...input, available },
        });
      } else {
        await createPetAsync(input);
      }

      Alert.alert('✅ Listo', isEditing ? 'Registro actualizado con éxito.' : '¡Mascota registrada con éxito!');
      router.replace('/my-pets');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* Título de la pantalla */}
      <View style={styles.headerTitles}>
        <Text style={styles.mainTitle}>{isEditing ? 'Editar Registro' : 'Registro de Mascota'}</Text>
        <Text style={styles.subtitle}>
          Ayúdanos a encontrar el hogar perfecto para este nuevo integrante del refugio.
        </Text>
      </View>

      {/* Zona de Fotografías */}
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.imageBoxMain} onPress={handlePickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imageMain} />
          ) : (
            <>
              <IconSymbol name="camera.viewfinder" color={PALETTE.textDark} size={32} />
              <Text style={styles.imageText}>Subir Foto Principal</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cajas secundarias simuladas visualmente como en tu diseño */}
        <View style={styles.secondaryPhotosRow}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.imageBoxSecondary}>
              <IconSymbol name="plus" color={PALETTE.textGray} size={20} />
            </View>
          ))}
        </View>

        <Text style={styles.tipText}>
          Tip: Fotos con luz natural y fondo despejado aumentan las posibilidades de adopción en un 40%.
        </Text>
      </View>

      {/* TARJETA 1: Información Básica */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="info.circle" color={PALETTE.primaryDark} size={20} />
          <Text style={styles.sectionTitle}>Información Básica</Text>
        </View>

        {/* Nombre */}
        <View style={styles.field}>
          <Text style={styles.label}>Nombre de la mascota</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Luna"
            value={name}
            onChangeText={setName}
            placeholderTextColor={PALETTE.textGray}
          />
        </View>

        <View style={styles.rowFields}>
          {/* Especie */}
          <View style={styles.halfField}>
            <Text style={styles.label}>Especie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SPECIES_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.pill, species === opt.value && styles.pillActive]}
                  onPress={() => setSpecies(opt.value)}
                >
                  <Text style={[styles.pillText, species === opt.value && styles.pillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.rowFields}>
          {/* Raza */}
          <View style={styles.halfField}>
            <Text style={styles.label}>Raza / Mezcla</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Golden Retr..."
              value={breed}
              onChangeText={setBreed}
              placeholderTextColor={PALETTE.textGray}
            />
          </View>
          {/* Peso */}
          <View style={styles.halfField}>
            <Text style={styles.label}>Peso (Kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 12.5"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              placeholderTextColor={PALETTE.textGray}
            />
          </View>
        </View>

        <View style={styles.rowFields}>
          {/* Edad */}
          <View style={[styles.halfField, { flex: 0.6 }]}>
            <Text style={styles.label}>Edad (Años/Meses)</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1, textAlign: 'center' }]}
                placeholder="Años"
                keyboardType="number-pad"
                value={ageYears}
                onChangeText={setAgeYears}
                placeholderTextColor={PALETTE.textGray}
              />
              <TextInput
                style={[styles.input, { flex: 1, textAlign: 'center' }]}
                placeholder="Meses"
                keyboardType="number-pad"
                value={ageMonths}
                onChangeText={setAgeMonths}
                placeholderTextColor={PALETTE.textGray}
              />
            </View>
          </View>

          {/* Tamaño */}
          <View style={[styles.halfField, { flex: 0.4 }]}>
            <Text style={styles.label}>Tamaño</Text>
            <View style={styles.sizeOptionsRow}>
              {SIZE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sizePill, size === opt.value && styles.sizePillActive]}
                  onPress={() => setSize(opt.value)}
                >
                  <Text style={[styles.sizePillText, size === opt.value && styles.sizePillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* TARJETA 2: Historia y Personalidad */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="doc.text" color={PALETTE.primaryDark} size={20} />
          <Text style={styles.sectionTitle}>Historia y Personalidad</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción corta</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cuéntanos un poco sobre su llegada al refugio y su carácter..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={PALETTE.textGray}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Temperamento (Palabras clave)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Sociable, Activo, Protector"
            value={temperament}
            onChangeText={setTemperament}
            placeholderTextColor={PALETTE.textGray}
          />
        </View>
      </View>

      {/* TARJETA 3: Salud y Disponibilidad */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="heart.text.square" color={PALETTE.primaryDark} size={20} />
          <Text style={styles.sectionTitle}>Salud y Adopción</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Estado Médico</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {HEALTH_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pillOutline, healthStatus === opt.value && styles.pillOutlineActive]}
                onPress={() => setHealthStatus(opt.value)}
              >
                <Text style={[styles.pillTextOutline, healthStatus === opt.value && styles.pillTextOutlineActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isEditing && (
          <View style={styles.availableRow}>
            <View>
              <Text style={[styles.label, { marginBottom: 2 }]}>Disponible para adopción</Text>
              <Text style={{ fontSize: 12, color: PALETTE.textGray }}>Visible para los adoptantes</Text>
            </View>
            <Switch 
              value={available} 
              onValueChange={setAvailable} 
              trackColor={{ false: PALETTE.border, true: PALETTE.primaryLight }}
              thumbColor={available ? PALETTE.primaryDark : PALETTE.white}
            />
          </View>
        )}
      </View>

      {/* Botones de Acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={PALETTE.white} size="small" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" color={PALETTE.white} size={20} />
              <Text style={styles.btnPrimaryText}>Guardar Registro</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.btnSecondaryText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: PALETTE.bgLight 
  },
  content: { 
    paddingHorizontal: 20, 
    paddingTop: 24,
    paddingBottom: 40 
  },
  headerTitles: {
    marginBottom: 24,
  },
  mainTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: PALETTE.textDark, 
    marginBottom: 8 
  },
  subtitle: {
    fontSize: 14,
    color: PALETTE.textGray,
    lineHeight: 20,
  },
  photoSection: {
    marginBottom: 24,
  },
  imageBoxMain: {
    width: '100%',
    height: 220,
    backgroundColor: PALETTE.inputBg,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#CBD5E1', // Gris sutil
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageMain: { 
    width: '100%', 
    height: '100%' 
  },
  imageText: { 
    fontSize: 13, 
    fontWeight: '600',
    color: PALETTE.textDark, 
    marginTop: 10 
  },
  secondaryPhotosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  imageBoxSecondary: {
    flex: 1,
    height: 80,
    backgroundColor: PALETTE.inputBg,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  tipText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: PALETTE.textGray,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.primaryDark,
  },
  field: { 
    marginBottom: 16 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: PALETTE.textDark, 
    marginBottom: 8 
  },
  input: {
    backgroundColor: PALETTE.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: PALETTE.textDark,
    fontWeight: '500',
  },
  textArea: { 
    height: 100,
    textAlignVertical: 'top', 
  },
  rowFields: { 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 16,
  },
  halfField: { 
    flex: 1 
  },
  // Píldoras horizontales
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: PALETTE.inputBg,
  },
  pillActive: { 
    backgroundColor: PALETTE.pillBg 
  },
  pillText: { 
    fontSize: 13, 
    color: PALETTE.textGray, 
    fontWeight: '600' 
  },
  pillTextActive: { 
    color: PALETTE.primaryDark,
    fontWeight: '800'
  },
  // Píldoras con borde (Salud)
  pillOutline: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.white,
  },
  pillOutlineActive: {
    borderColor: PALETTE.primaryLight,
    backgroundColor: PALETTE.pillBg,
  },
  pillTextOutline: {
    fontSize: 13,
    color: PALETTE.textGray,
    fontWeight: '600',
  },
  pillTextOutlineActive: {
    color: PALETTE.primaryDark,
    fontWeight: '800',
  },
  // Opciones de Tamaño (P, M, G)
  sizeOptionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    backgroundColor: PALETTE.inputBg,
    borderRadius: 12,
    padding: 4,
  },
  sizePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sizePillActive: {
    backgroundColor: PALETTE.primaryLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sizePillText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: PALETTE.textGray 
  },
  sizePillTextActive: { 
    color: PALETTE.primaryDark 
  },
  availableRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 8,
  },
  buttonContainer: { 
    gap: 12, 
    marginTop: 10, 
  },
  btn: { 
    flexDirection: 'row',
    paddingVertical: 16, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8,
  },
  btnPrimary: { 
    backgroundColor: PALETTE.primaryDark,
    shadowColor: PALETTE.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: { 
    color: PALETTE.white, 
    fontWeight: '800', 
    fontSize: 16 
  },
  btnSecondary: { 
    backgroundColor: PALETTE.white, 
    borderWidth: 1.5, 
    borderColor: PALETTE.primaryDark 
  },
  btnSecondaryText: { 
    color: PALETTE.primaryDark, 
    fontWeight: '800', 
    fontSize: 16 
  },
});

================================================
📄 ARCHIVO: app\(app)\pets\my-pets\index.tsx
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '../../../../components/ui/icon-symbol';

// 🎨 Paleta "Pet & Nature"
const PALETTE = {
  primaryDark: "#056A55",   // Verde oscuro
  primaryLight: "#1DD3B0",  // Verde agua
  pillBg: "#E8F7F5",        // Fondo suave (Edición/Aprobación)
  coralRed: "#F28482",      // Rojo suave/Coral
  dangerRed: "#E63946",     // Rojo fuerte (Eliminar/No disponible)
  dangerBg: "#FFF0F0",      // Fondo rojo suave
  white: "#FFFFFF",
  bgLight: "#F8F9FA",       // Fondo general
  textDark: "#2B2D42",      // Texto principal
  textGray: "#8D99AE",      // Texto secundario
  border: "#E2E8F0",
};

export default function MyShelterPetsScreen() {
  const { shelterPets, isLoadingShelter, deletePet, isDeleting } = usePets();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const isShelter = user?.role === 'shelter';

  const handleDeletePet = (petId: string, petName: string) => {
    Alert.alert(
      'Retirar mascota',
      `¿Estás seguro de que quieres retirar a ${petName} del refugio? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, retirar',
          style: 'destructive',
          onPress: () => {
            deletePet(petId);
          },
        },
      ]
    );
  };

  const renderPetItem = ({ item }: { item: any }) => (
    <View style={styles.petCard}>
      <TouchableOpacity
        style={styles.petContent}
        onPress={() => router.push(`/${item.id}`)}
        activeOpacity={0.8}
      >
        {/* Imagen de la mascota */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.petImage} resizeMode="cover" />
        ) : (
          <View style={[styles.petImage, styles.imagePlaceholder]}>
            <IconSymbol name="pawprint.fill" color={PALETTE.textGray} size={30} />
          </View>
        )}

        {/* Información */}
        <View style={styles.petInfo}>
          <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.petBreed} numberOfLines={1}>{item.breed || 'Sin raza especificada'}</Text>
          
          <View style={styles.petMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.available ? PALETTE.pillBg : PALETTE.dangerBg },
              ]}
            >
              <IconSymbol 
                name={item.available ? "checkmark.circle.fill" : "xmark.circle.fill"} 
                color={item.available ? PALETTE.primaryDark : PALETTE.dangerRed} 
                size={12} 
              />
              <Text
                style={[
                  styles.statusText,
                  { color: item.available ? PALETTE.primaryDark : PALETTE.dangerRed },
                ]}
              >
                {item.available ? 'Disponible' : 'Adoptado / Inactivo'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Botones de Acción (Derecha) */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => router.push(`/pets/my-pets/${item.id}/edit`)}
        >
          <IconSymbol name="pencil" color={PALETTE.primaryDark} size={18} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, isDeleting && { opacity: 0.5 }]}
          onPress={() => handleDeletePet(item.id, item.name)}
          disabled={isDeleting}
        >
          <IconSymbol name="trash.fill" color={PALETTE.dangerRed} size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isShelter) {
    return (
      <View style={styles.centered}>
        <IconSymbol name="lock.fill" color={PALETTE.textGray} size={40} />
        <Text style={styles.errorText}>Solo los refugios autorizados pueden ver esta sección.</Text>
      </View>
    );
  }

  if (isLoadingShelter) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PALETTE.primaryDark} />
        <Text style={styles.loadingText}>Cargando tus mascotas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Premium */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Mascotas</Text>
          <Text style={styles.headerSubtitle}>
            {shelterPets.length} {shelterPets.length === 1 ? 'registrada' : 'registradas'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/pets/my-pets/create')}
        >
          <IconSymbol name="plus" color={PALETTE.white} size={18} />
          <Text style={styles.addButtonText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Mascotas */}
      {shelterPets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <IconSymbol name="house.fill" color={PALETTE.textGray} size={40} />
          </View>
          <Text style={styles.emptyTitle}>Tu refugio está vacío</Text>
          <Text style={styles.emptySubtitle}>Comienza a registrar las mascotas que están buscando un nuevo hogar.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/pets/my-pets/create')}
          >
            <IconSymbol name="plus" color={PALETTE.white} size={18} />
            <Text style={styles.emptyButtonText}>Crear primer registro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shelterPets}
          renderItem={renderPetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: PALETTE.bgLight 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorText: { 
    fontSize: 15, 
    color: PALETTE.textGray, 
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: PALETTE.textGray,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: PALETTE.white,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: PALETTE.textDark 
  },
  headerSubtitle: { 
    fontSize: 13, 
    fontWeight: '600',
    color: PALETTE.textGray, 
    marginTop: 2 
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: PALETTE.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: PALETTE.white,
    fontWeight: '800',
    fontSize: 14,
  },
  listContent: { 
    paddingHorizontal: 16, 
    paddingVertical: 20, 
    gap: 16 
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  petContent: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  petImage: { 
    width: 85, 
    height: 85, 
    borderRadius: 16,
    backgroundColor: PALETTE.bgLight,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  petInfo: { 
    flex: 1, 
    paddingHorizontal: 14, 
    justifyContent: 'center' 
  },
  petName: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: PALETTE.textDark,
    marginBottom: 2,
  },
  petBreed: { 
    fontSize: 13, 
    color: PALETTE.textGray, 
    fontWeight: '500',
    marginBottom: 8 
  },
  petMeta: { 
    flexDirection: 'row' 
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8,
    gap: 4,
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actions: { 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    gap: 10,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: PALETTE.border,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: PALETTE.pillBg,
  },
  deleteButton: {
    backgroundColor: PALETTE.dangerBg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 60,
  },
  emptyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: PALETTE.textDark, 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: PALETTE.textGray, 
    textAlign: 'center', 
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    shadowColor: PALETTE.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: { 
    color: PALETTE.white, 
    fontWeight: '800', 
    fontSize: 15 
  },
});

================================================
📄 ARCHIVO: app\(app)\pets\my-pets\[petId]\edit.tsx
================================================

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function EditPetScreen() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Simplemente redirigir a la pantalla create con el petId como parámetro
    // La pantalla create maneja tanto creación como edición
    if (petId) {
      router.replace(`/pets/my-pets/create?petId=${petId}`);
    }
  }, [petId]);

  return null;
}


================================================
📄 ARCHIVO: app\(app)\profile.tsx
================================================

/**
 * CAPA: Presentación
 * Pantalla de perfil del usuario con mapa, ubicación actual o manual.
 * Diseño modernizado y limpio tipo "Voyager".
 */
import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { IconSymbol } from "../../components/ui/icon-symbol";
import LottieView from "lottie-react-native";

import Adios from "../../assets/animations/adios.json";

const CORAL = "#A86A5A";
const TEAL  = "#0F6966"; // Ajustado para mantener consistencia con el mapa anterior

// Estilo JSON para limpiar el mapa nativo (similar a CartoDB Voyager)
const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b2a6" }] },
  { featureType: "administrative.land_parcel", elementType: "geometry.stroke", stylers: [{ color: "#dcd2be" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#ae9e90" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#93817c" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#a5b076" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#447530" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f1e6" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfcf8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c967" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e9bc62" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#e98d58" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry.stroke", stylers: [{ color: "#db8555" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#806b63" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "transit.line", elementType: "labels.text.fill", stylers: [{ color: "#8f7d77" }] },
  { featureType: "transit.line", elementType: "labels.text.stroke", stylers: [{ color: "#ebe3cd" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b9d3c2" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#92998d" }] }
];

export default function ProfileScreen() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const { logout, updateLocation, isUpdatingLocation } = useAuth();

  const isShelter = user?.role === "shelter";
  const accent = isShelter ? CORAL : TEAL;

  const [mapRegion, setMapRegion] = useState({
    latitude:       user?.location?.latitude  ?? -2.1962,
    longitude:      user?.location?.longitude ?? -79.8862,
    latitudeDelta:  0.05,
    longitudeDelta: 0.05,
  });
  
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(
    user?.location ? { latitude: user.location.latitude, longitude: user.location.longitude } : null
  );
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para la animación de salida

  const handleGetCurrentLocation = async () => {
    setLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación para centrar el mapa.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setSelectedCoords(coords);
      setMapRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch {
      Alert.alert("Error", "No se pudo obtener tu ubicación actual.");
    } finally {
      setLoadingGPS(false);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
  };

  const handleSaveLocation = async () => {
    if (!selectedCoords) {
      Alert.alert("Sin ubicación", "Toca el mapa o usa tu ubicación actual antes de guardar.");
      return;
    }
    updateLocation({
      latitude:  selectedCoords.latitude,
      longitude: selectedCoords.longitude,
    });
    Alert.alert("✅ Ubicación guardada", "Tu perfil ha sido actualizado correctamente.");
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Esperamos 2.5 segundos para que la animación se vea antes de cerrar sesión
    setTimeout(() => {
      logout();
    }, 2500); 
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Cabecera del Perfil */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: accent }]}>
            <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() ?? "?"}</Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={[styles.roleBadge, { backgroundColor: accent + "15", borderColor: accent + "40" }]}>
            <IconSymbol name={isShelter ? "building.2.fill" : "pawprint.fill"} color={accent} size={14} />
            <Text style={[styles.roleText, { color: accent }]}>{isShelter ? "Refugio Registrado" : "Adoptante"}</Text>
          </View>
        </View>

        {/* Tarjeta de Ubicación */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: accent + "15" }]}>
              <IconSymbol name="map.fill" color={accent} size={18} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Área de Operación</Text>
              <Text style={styles.cardSubtitle}>
                Toca el mapa para ajustar tu posición exacta.
              </Text>
            </View>
          </View>

          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
              customMapStyle={mapStyle} // Aplica el estilo limpio al mapa
            >
              {/* MARCADOR PERSONALIZADO NATIVO */}
              {selectedCoords && (
                <Marker coordinate={selectedCoords} title="Tu ubicación">
                  <View style={styles.customMarkerWrapper}>
                    <View style={[styles.customMarkerCircle, { backgroundColor: accent }]}>
                      <IconSymbol name={isShelter ? "house.fill" : "person.fill"} color="#FFF" size={18} />
                    </View>
                    <View style={styles.customMarkerShadow} />
                  </View>
                </Marker>
              )}
            </MapView>
          </View>

          {selectedCoords && (
            <View style={styles.coordsBox}>
              <IconSymbol name="location.viewfinder" color="#888" size={14} />
              <Text style={styles.coordsText}>
                {selectedCoords.latitude.toFixed(5)}, {selectedCoords.longitude.toFixed(5)}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: accent }]}
              onPress={handleGetCurrentLocation}
              disabled={loadingGPS}
              activeOpacity={0.7}
            >
              {loadingGPS ? (
                <ActivityIndicator color={accent} size="small" />
              ) : (
                <>
                  <IconSymbol name="location.fill" color={accent} size={16} />
                  <Text style={[styles.btnOutlineText, { color: accent }]}>Mi GPS</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: accent }, isUpdatingLocation && styles.btnDisabled]}
              onPress={handleSaveLocation}
              disabled={isUpdatingLocation}
              activeOpacity={0.8}
            >
              {isUpdatingLocation ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>Guardar Posición</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Cerrar Sesión (Ahora llama a handleLogout) */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.8}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" color="#fff" size={18} />
          <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* OVERLAY DE DESPEDIDA */}
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <LottieView
            autoPlay
            loop={false}
            source={Adios} // <-- REEMPLAZA ESTO CON EL NOMBRE DE TU LOTTIE
            style={styles.lottieLogout}
          />
          <Text style={styles.logoutMessage}>¡Hasta pronto!</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F4F6F8" 
  },
  content: { 
    padding: 20, 
    alignItems: "center", 
    paddingBottom: 80 
  },
  
  // Header
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  avatarCircle: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 16, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10, 
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFF"
  },
  avatarText: { color: "#fff", fontSize: 40, fontWeight: "800" },
  username: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", marginBottom: 4, letterSpacing: -0.5 },
  email: { fontSize: 15, color: "#666", marginBottom: 14 },
  roleBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 6 
  },
  roleText: { fontSize: 13, fontWeight: "700" },

  // Tarjeta (Card)
  card: { 
    width: "100%", 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 24, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 3 
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", marginBottom: 2 },
  cardSubtitle: { fontSize: 13, color: "#888" },
  
  // Mapa
  mapWrapper: { 
    borderRadius: 16, 
    overflow: "hidden", 
    marginBottom: 12, 
    height: 240, 
    backgroundColor: "#EFEFEF", 
  },
  map: { flex: 1 },
  
  // Estilos del Marcador Personalizado
  customMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarkerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  customMarkerShadow: {
    width: 12,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1,
  },

  coordsBox: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F8F9FA", 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 16, 
  },
  coordsText: { fontSize: 13, color: "#666", fontFamily: "monospace", letterSpacing: 0.5 },
  
  // Botones
  actionRow: { flexDirection: "row", gap: 12 },
  btnOutline: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 6, 
    borderWidth: 1.5, 
    borderRadius: 14, 
    paddingVertical: 14 
  },
  btnOutlineText: { fontSize: 14, fontWeight: "700" },
  btnPrimary: { 
    flex: 1.5, 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: 14, 
    paddingVertical: 14 
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
  
  // Logout
  btnLogout: { 
    width: "100%", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    backgroundColor: "#FF5252", 
    borderRadius: 16, 
    paddingVertical: 16, 
    shadowColor: "#FF5252", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4 
  },
  btnLogoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Estilos para el overlay de cierre de sesión
  logoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Asegura que quede por encima de todo
  },
  lottieLogout: {
    width: 200,
    height: 200,
  },
  logoutMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 10,
  }
});

================================================
📄 ARCHIVO: app\(app)\shelters-map.tsx
================================================

/**
 * CAPA: Presentation
 * Pantalla de mapa de refugios usando WebView + Leaflet + OpenStreetMap (Estilo Custom)
 */

import { useShelters } from '@features/shelters/presentation/hooks/useShelters';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { IconSymbol } from '../../components/ui/icon-symbol';

const CORAL = '#A86A5A';
const TEAL = '#0F6966'; // Ajustado para ser más similar al verde oscuro de la imagen

export default function SheltersMapScreen() {
  const { sheltersWithLocation, isLoading, error, refetch } = useShelters();
  const webViewRef = useRef<WebView>(null);
  const [webViewReady, setWebViewReady] = useState(false);

  // Generar HTML de Leaflet con diseño personalizado
  const generateMapHTML = () => {
    const markers = sheltersWithLocation
      .map((shelter, index) => {
        // Alternar iconos para dar el efecto de la imagen (puedes cambiar esta lógica luego según el tipo de refugio)
        const iconTypes = ['paw', 'home', 'heart'];
        const currentIcon = iconTypes[index % 3];
        
        return `
      {
        id: "${shelter.id}",
        lat: ${shelter.location?.latitude},
        lng: ${shelter.location?.longitude},
        name: "${shelter.username.replace(/"/g, '\\"')}",
        description: "${(shelter.description || '').replace(/"/g, '\\"')}",
        phone: "${shelter.phone || 'No disponible'}",
        address: "${(shelter.location?.address || 'Dirección no disponible').replace(/"/g, '\\"')}",
        iconType: "${currentIcon}"
      }
    `;
      })
      .join(',');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FCFAF8; }
        #map { width: 100vw; height: 100vh; }
        
        /* Ocultar controles por defecto para un look más limpio */
        .leaflet-control-zoom { display: none; }
        
        /* ESTILOS DE LOS MARCADORES PERSONALIZADOS */
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        .marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 120px;
          margin-left: -60px; /* Centrar absoluto */
          margin-top: -50px;
        }
        .marker-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          border: 2px solid white;
          z-index: 2;
        }
        .marker-label {
          background: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #222;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-top: -12px;
          z-index: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* ESTILOS DEL POPUP (TIPO TARJETA) */
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 260px !important;
        }
        .leaflet-popup-tip-container {
          display: none; /* Quitamos la flecha del popup para que parezca una tarjeta flotante */
        }
        
        .card-content {
          padding: 20px;
          background: white;
        }
        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #222;
          margin-bottom: 8px;
        }
        .card-info {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-info i { color: ${TEAL}; width: 14px; text-align: center; }
        .action-button {
          margin-top: 12px;
          background: ${TEAL};
          color: white;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Coordenadas centrales por defecto (Ecuador)
        const map = L.map('map', { zoomControl: false }).setView([-2.1962, -79.8862], 6);
        
        // Usamos CartoDB Voyager para un mapa limpio y con tonos suaves como en la imagen
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        
        const shelters = [${markers}];
        
        shelters.forEach(shelter => {
          // Lógica de colores según el icono
          const bgColor = shelter.iconType === 'heart' ? '${CORAL}' : '${TEAL}';
          
          // HTML del Marcador
          const markerHTML = \`
            <div class="marker-wrapper">
              <div class="marker-circle" style="background-color: \${bgColor};">
                <i class="fa-solid fa-\${shelter.iconType}"></i>
              </div>
              <div class="marker-label">\${shelter.name}</div>
            </div>
          \`;

          // HTML del Popup (Tarjeta de información)
          const popupContent = \`
            <div class="card-content">
              <div class="card-title">\${shelter.name}</div>
              <div class="card-info">
                <i class="fa-solid fa-location-dot"></i>
                <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${shelter.address}</span>
              </div>
              <div class="card-info">
                <i class="fa-solid fa-phone"></i>
                <span>\${shelter.phone}</span>
              </div>
            </div>
          \`;
          
          // Configurar el marcador personalizado
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: markerHTML,
            iconSize: [120, 80],
            iconAnchor: [60, 40], // Centro inferior
            popupAnchor: [0, -35] // Dónde aparece la tarjeta
          });

          L.marker([shelter.lat, shelter.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent);
        });
        
        // Ajustar la vista para que todos los marcadores sean visibles
        if (shelters.length > 0) {
          const group = new L.featureGroup(
            shelters.map(s => L.marker([s.lat, s.lng]))
          );
          map.fitBounds(group.getBounds().pad(0.2));
        }
        
        window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ready' }));
      </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'ready') {
      setWebViewReady(true);
    }
  };

  const handleRetry = () => {
    setWebViewReady(false);
    refetch();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" color={CORAL} size={40} />
          <Text style={styles.errorTitle}>Error al cargar refugios</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: CORAL }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (sheltersWithLocation.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <IconSymbol name="map" color={TEAL} size={50} />
          <Text style={styles.emptyTitle}>Sin ubicaciones</Text>
          <Text style={styles.emptyMessage}>
            Aún no hay refugios con ubicación registrada
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: TEAL }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Badge con contador */}
      <View style={styles.badge}>
        <IconSymbol name="location.fill" color="#fff" size={14} />
        <Text style={styles.badgeText}>
          {sheltersWithLocation.length} refugio{sheltersWithLocation.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* WebView con mapa */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHTML() }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={TEAL} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  badge: {
    position: 'absolute',
    top: 50, // Ajustado para evitar el notch/status bar
    left: 20,
    backgroundColor: TEAL,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FCFAF8',
  },
  loadingText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  emptyMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

================================================
📄 ARCHIVO: app\(app)\[petId].tsx
================================================

import { useAdoptionRequests } from '@features/adoptionRequests/presentation/hooks/useAdoptionRequests';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

// 🎨 Paleta Premium "Pet & Nature"
const PALETTE = {
  primaryDark: "#056A55",   // Verde oscuro principal
  primaryLight: "#1DD3B0",  // Verde agua claro
  pillBg: "#F1F5F9",        // Gris/Celeste muy suave (Moderno)
  coralRed: "#E11D48",      // Rojo fuerte para alertas/eliminar
  softYellow: "#FEF3C7",    // Amarillo suave para salud
  yellowText: "#92400E",    // Texto oscuro para el amarillo
  white: "#FFFFFF",
  bgLight: "#F8FAFC",       // Fondo general
  textDark: "#0F172A",      // Texto principal muy oscuro
  textGray: "#64748B",      // Texto secundario
  border: "#E2E8F0",
  
  // Colores dedicados a botones de acción
  editBg: "#E0F2FE",        // Celeste claro
  editIcon: "#0284C7",      // Azul oscuro
  deleteBg: "#FFE4E6",      // Rosado claro
  deleteIcon: "#E11D48",    // Rojo oscuro
};

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { shelterPets, availablePets, deletePetAsync, updatePetAsync } = usePets();
  const { createRequestAsync } = useAdoptionRequests();

  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Nuevo estado para controlar la animación Lottie
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Obtener mascota por ID - buscar en ambas listas
  const pet = shelterPets.find((p) => p.id === petId) || 
              availablePets.find((p) => p.id === petId);

  const isShelterOwner = user?.role === 'shelter' && pet?.shelterId === user.id;

  const handleSubmitRequest = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para solicitar una mascota');
      return;
    }

    if (!requestMessage.trim()) {
      Alert.alert('Error', 'Por favor escribe un mensaje al refugio');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequestAsync({
        petId: petId!,
        shelterId: pet!.shelterId,
        message: requestMessage,
      });
      
      // En lugar de una alerta, mostramos la animación
      setShowSuccessAnimation(true);
      
      // Esperamos 2.5 segundos para que la animación termine antes de salir
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setRequestMessage('');
        router.back();
      }, 2500);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud');
      setIsSubmitting(false); // Solo lo apagamos si hay error, si hay éxito la pantalla se desmonta
    }
  };

  const handleDeletePet = () => {
    Alert.alert(
      'Eliminar mascota',
      '¿Estás seguro de que deseas retirar a esta mascota?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deletePetAsync(petId!);
              Alert.alert('Éxito', 'Mascota eliminada correctamente');
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar la mascota');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditPet = () => {
    router.push(`/pets/my-pets/${petId}/edit?petId=${petId}`);
  };

  if (!pet) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.emptyCircle}>
          <IconSymbol name="pawprint.fill" color={PALETTE.textGray} size={40} />
        </View>
        <Text style={styles.loadingText}>Mascota no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Imagen principal (Gran formato, diseño hero) */}
        <View style={styles.imageWrapper}>
          {pet.imageUrl ? (
            <Image source={{ uri: pet.imageUrl }} style={styles.mainImage} resizeMode="cover" />
          ) : (
            <View style={[styles.mainImage, styles.imagePlaceholder]}>
              <IconSymbol name="photo.fill" color={PALETTE.textGray} size={60} />
            </View>
          )}
        </View>

        {/* Contenedor superpuesto estilo "Hoja que sube" */}
        <View style={styles.contentWrapper}>
          
          {/* Cabecera: Nombre, Raza y Botones de acción */}
          <View style={styles.header}>
            <View style={styles.headerTitles}>
              <Text style={styles.petName} numberOfLines={2}>{pet.name}</Text>
              <View style={styles.breedRow}>
                <IconSymbol name="pawprint.fill" color={PALETTE.primaryDark} size={14} />
                <Text style={styles.petBreed}>{pet.breed || 'Raza mixta'}</Text>
              </View>
            </View>
            
            {/* Botones de acción solo si es el dueño del refugio */}
            {isShelterOwner && (
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={[styles.actionCircle, { backgroundColor: PALETTE.editBg }]} 
                  onPress={handleEditPet}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="pencil" color={PALETTE.editIcon} size={22} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionCircle, { backgroundColor: PALETTE.deleteBg }]} 
                  onPress={handleDeletePet} 
                  disabled={isDeleting}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="trash.fill" color={PALETTE.deleteIcon} size={22} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Alerta si no está disponible */}
          {!pet.available && (
            <View style={styles.unavailableAlert}>
              <IconSymbol name="info.circle.fill" color={PALETTE.coralRed} size={20} />
              <Text style={styles.unavailableText}>Esta mascota ya encontró un hogar o no está disponible en este momento.</Text>
            </View>
          )}

          {/* Widgets de Características (Grid de 2x2) */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Género/Esp.</Text>
              <Text style={styles.statValue}>
                {pet.species === 'dog' ? 'Perro' : pet.species === 'cat' ? 'Gato' : pet.species}
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Edad</Text>
              <Text style={styles.statValue}>
                {pet.ageYears ? `${pet.ageYears}a ` : ''}{pet.ageMonths ? `${pet.ageMonths}m` : 'N/A'}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tamaño</Text>
              <Text style={styles.statValue}>{pet.size}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Peso</Text>
              <Text style={styles.statValue}>{pet.weightKg || pet.weight || '?'} kg</Text>
            </View>
          </View>

          {/* Estado de Salud (Card destacada) */}
          <View style={styles.healthTag}>
            <View style={styles.healthIconContainer}>
              <IconSymbol name="heart.text.square.fill" color={PALETTE.yellowText} size={24} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.healthLabel}>Estado de Salud Médico</Text>
              <Text style={styles.healthValue}>{pet.healthStatus}</Text>
            </View>
          </View>

          {/* Descripción (Sobre Mí) */}
          {pet.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre Mí</Text>
              <Text style={styles.description}>{pet.description}</Text>
            </View>
          )}

          {/* Personalidad / Temperamento */}
          {pet.temperament && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mi Personalidad</Text>
              <Text style={styles.description}>{pet.temperament}</Text>
            </View>
          )}

          {/* Área de Adopción (Solo para usuarios normales) */}
          {!isShelterOwner && pet.available && (
            <View style={styles.adoptionSection}>
              <Text style={styles.sectionTitle}>¿Te enamoraste?</Text>
              <Text style={styles.adoptionSubtitle}>Envía un mensaje al refugio y da el primer paso para cambiarle la vida.</Text>
              
              <TextInput
                style={styles.messageInput}
                placeholder="Hola, me encantaría darle un hogar a..."
                placeholderTextColor={PALETTE.textGray}
                multiline
                numberOfLines={4}
                value={requestMessage}
                onChangeText={setRequestMessage}
                editable={!isSubmitting}
              />
              
              <TouchableOpacity
                style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
                onPress={handleSubmitRequest}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting && !showSuccessAnimation ? (
                  <ActivityIndicator color={PALETTE.white} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Enviar Solicitud de Adopción</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* OVERLAY DE ANIMACIÓN LOTTIE */}
      {showSuccessAnimation && (
        <View style={styles.lottieOverlay}>
          <LottieView
            autoPlay
            loop={false}
            // Asegúrate de colocar tu archivo JSON en esta ruta o actualízala
            source={require('../../assets/animations/paw-success.json')} 
            style={styles.lottieAnimation}
          />
          <Text style={styles.lottieText}>¡Solicitud enviada con éxito!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: PALETTE.bgLight,
  },
  container: { 
    flex: 1, 
  },
  centeredContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: PALETTE.bgLight 
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PALETTE.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: { 
    fontSize: 16, 
    color: PALETTE.textDark, 
    fontWeight: '700',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: PALETTE.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: { 
    color: PALETTE.white, 
    fontWeight: '700', 
    fontSize: 15 
  },
  imageWrapper: {
    width: '100%',
    height: 400,
    backgroundColor: PALETTE.pillBg,
  },
  mainImage: { 
    width: '100%', 
    height: '100%', 
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: PALETTE.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  headerTitles: {
    flex: 1,
    paddingRight: 10,
  },
  petName: { 
    fontSize: 34, 
    fontWeight: '900', 
    color: PALETTE.textDark,
    marginBottom: 6,
    lineHeight: 40,
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petBreed: { 
    fontSize: 16, 
    color: PALETTE.primaryDark, 
    fontWeight: '700' 
  },
  headerActions: { 
    flexDirection: 'row', 
    gap: 12,
  },
  actionCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  unavailableAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 24,
    gap: 12,
  },
  unavailableText: { 
    flex: 1,
    fontSize: 14, 
    color: PALETTE.coralRed, 
    fontWeight: '700',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    width: '48%',
    backgroundColor: PALETTE.bgLight,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  statLabel: { 
    fontSize: 13, 
    color: PALETTE.textGray, 
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: { 
    fontSize: 16, 
    color: PALETTE.textDark, 
    fontWeight: '800',
    textTransform: 'capitalize' 
  },
  healthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.softYellow,
    padding: 16,
    borderRadius: 24,
    marginBottom: 28,
  },
  healthIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 13,
    color: PALETTE.yellowText,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 2,
  },
  healthValue: {
    fontSize: 16,
    color: PALETTE.yellowText,
    fontWeight: '800',
  },
  section: { 
    marginBottom: 28,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: PALETTE.textDark, 
    marginBottom: 12,
  },
  description: { 
    fontSize: 16, 
    color: PALETTE.textGray, 
    lineHeight: 26,
    fontWeight: '500',
  },
  adoptionSection: {
    marginTop: 10,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: PALETTE.border,
  },
  adoptionSubtitle: {
    fontSize: 15,
    color: PALETTE.textGray,
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 22,
  },
  messageInput: {
    backgroundColor: PALETTE.bgLight,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: PALETTE.textDark,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: PALETTE.primaryDark,
    paddingVertical: 18,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonDisabled: { 
    opacity: 0.7 
  },
  primaryButtonText: { 
    color: PALETTE.white, 
    fontWeight: '800', 
    fontSize: 16,
    letterSpacing: 0.5,
  },
  
  // --- NUEVOS ESTILOS PARA LOTTIE ---
  lottieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semitransparente elegante
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Asegura que se ponga encima de todo
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  lottieText: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.primaryDark,
    marginTop: -20, // Ajusta según el padding interno de tu archivo lottie
  }
});

================================================
📄 ARCHIVO: app\(app)\_layout.tsx
================================================

import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Tabs } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";

// 🎨 Nueva paleta de colores "Pet & Nature"
const PALETTE = {
  darkGreen: "#2D6A4F",   // Verde oscuro (Elegante, seguridad, Refugios)
  lightGreen: "#52B788",  // Verde claro (Fresco, amigable, Adoptantes)
  softYellow: "#FFF7D6",  // Amarillo clarito (Para fondos o acentos suaves)
  coralRed: "#E63946",    // Rojo coral (Para destacar corazones o alertas)
  gray: "#B7B7B7",        // Gris para íconos inactivos
  white: "#FFFFFF",
};

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isShelter = user?.role === "shelter";

  // El color principal cambia según el rol para dar identidad visual adaptativa
  const primaryColor = isShelter ? PALETTE.darkGreen : PALETTE.lightGreen;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { 
          backgroundColor: primaryColor,
          shadowColor: "transparent", 
          elevation: 0, 
        },
        headerTintColor: PALETTE.white,
        headerTitleStyle: { 
          fontWeight: "800", 
          fontSize: 20, 
          letterSpacing: 0.5 
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: PALETTE.gray,
        tabBarStyle: { 
          backgroundColor: PALETTE.white,
          borderTopWidth: 0, 
          shadowColor: primaryColor, 
          shadowOffset: { width: 0, height: -4 }, 
          shadowOpacity: 0.08, 
          shadowRadius: 12, 
          elevation: 15, 
          height: 65, 
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: "700",
          marginTop: -4 
        },
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={[styles.rolePill, { backgroundColor: isShelter ? "#1B4332" : "#40916C" }]}>
              <Text style={styles.rolePillText}>
                {isShelter ? "Refugio" : "Adoptante"}
              </Text>
            </View>
          </View>
        ),
      }}
    >
      {/* Mascotas (listado para adoptantes, gestión para refugios) */}
      <Tabs.Screen
        name="index"
        options={{
          title: isShelter ? "Mi Refugio" : "Mascotas",
          tabBarLabel: isShelter ? "Refugio" : "Explorar",
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              name={isShelter ? "house.fill" : "pawprint.fill"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />

      {/* Mis mascotas - solo para refugios */}
      <Tabs.Screen
        name="pets/my-pets/index"
        options={{
          href: isShelter ? "/pets/my-pets" : null,
          title: "Gestionar mascotas",
          tabBarLabel: "Mis mascotas",
          tabBarIcon: ({ color }) => <IconSymbol name="square.and.pencil" color={color} size={24} />,
        }}
      />

      {/* Solicitudes de adopción */}
      <Tabs.Screen
        name="pets/adoption-requests/index"
        options={{
          title: isShelter ? "Solicitudes" : "Mis solicitudes",
          tabBarLabel: "Solicitudes",
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              name="heart.fill" 
              color={color} 
              size={24} 
            />
          ),
        }}
      />

      {/* Mapa de refugios - para ambos roles */}
      <Tabs.Screen
        name="shelters-map"
        options={{
          title: "Mapa de Refugios",
          tabBarLabel: "Mapa",
          tabBarIcon: ({ color }) => <IconSymbol name="map.fill" color={color} size={24} />,
        }}
      />

      {/* Asistente IA - para ambos roles */}
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: "Asistente Veterinario",
          tabBarLabel: "Asistente",
          tabBarIcon: ({ color }) => <IconSymbol name="message.fill" color={color} size={24} />,
        }}
      />

      {/* Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mi Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} size={24} />,
        }}
      />

      {/* 🚫 Pantallas ocultas del tab bar */}
      <Tabs.Screen name="[petId]" options={{ href: null, title: "Detalles", headerShown: true }} />
      <Tabs.Screen name="pets/my-pets/[petId]/edit" options={{ href: null, title: "Editar mascota", headerShown: true }} />
      <Tabs.Screen name="pets/my-pets/create" options={{ href: null, title: "Crear mascota", headerShown: true }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginRight: 16,
  },
  rolePill: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  rolePillText: { 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "800",
    textTransform: "uppercase", 
    letterSpacing: 0.5,
  },
});

================================================
📄 ARCHIVO: app\(auth)\login.tsx
================================================

import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";

// 🎨 Paleta "Pet & Nature" consistente
const PALETTE = {
  primaryDark: "#056A55",   // Verde oscuro
  primaryLight: "#1DD3B0",  // Verde agua
  white: "#FFFFFF",
  bgLight: "#FAFAFC",       // Fondo general
  inputBackground: "#F5F7FA",// Fondo de los inputs
  inputBorder: "#E2E8F0",   // Borde suave
  inputIcon: "#94A3B8",     // Color iconos
  accentCoral: "#A86A5A",   // Coral
  textDark: "#2B2D42",      // Texto principal
  textGray: "#64748B",      // Texto secundario
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { login, loginWithGoogle, resetPassword, isLoading, isResettingPassword, error } = useAuth();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setResetFeedback({ type: "error", message: "Ingresa tu correo para recuperar la contraseña." });
      return;
    }
    try {
      await resetPassword({ email: email.trim() });
      setResetFeedback({ type: "success", message: "Revisa tu correo. Enviamos instrucciones." });
    } catch (err) {
      setResetFeedback({ type: "error", message: "No se pudo enviar el correo." });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <LottieView source={require("../../assets/animations/pets.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <IconSymbol name="exclamationmark.triangle.fill" color={PALETTE.accentCoral} size={16} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Formulario Moderno */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Correo electrónico</Text>
          <View style={styles.inputContainerModern}>
            <IconSymbol name="envelope.fill" color={PALETTE.inputIcon} size={20} />
            <TextInput
              style={styles.inputModern}
              placeholder="tu@ejemplo.com"
              placeholderTextColor={PALETTE.textGray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={styles.inputContainerModern}>
            <IconSymbol name="lock.fill" color={PALETTE.inputIcon} size={20} />
            <TextInput
              style={styles.inputModern}
              placeholder="••••••••"
              placeholderTextColor={PALETTE.textGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{padding: 5}}>
              <IconSymbol name={showPass ? "eye.slash.fill" : "eye.fill"} color={PALETTE.inputIcon} size={18} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword} disabled={isResettingPassword}>
            <Text style={styles.forgotText}>{isResettingPassword ? "Enviando..." : "¿Olvidaste tu contraseña?"}</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback reset */}
        {resetFeedback && (
          <View style={[styles.feedbackBox, resetFeedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError]}>
            <Text style={resetFeedback.type === "success" ? styles.feedbackSuccessText : styles.feedbackErrorText}>
              {resetFeedback.message}
            </Text>
          </View>
        )}

        {/* Botón Ingresar */}
        <TouchableOpacity 
            style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
            onPress={() => login({ email, password })} 
            disabled={isLoading} 
            activeOpacity={0.85}
        >
          {isLoading ? <ActivityIndicator color={PALETTE.white} /> : <Text style={styles.btnPrimaryText}>Ingresar</Text>}
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>o</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Botón Google */}
        <TouchableOpacity style={styles.btnGoogle} onPress={() => loginWithGoogle()} activeOpacity={0.8}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.btnGoogleText}>Continuar con Google</Text>
        </TouchableOpacity>

        {/* Link registro */}
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkAccent}>Regístrate</Text></Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: PALETTE.bgLight },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  lottie: { width: 140, height: 140 },
  title: { fontSize: 32, fontWeight: "900", color: PALETTE.textDark, marginTop: -10 },
  subtitle: { fontSize: 15, color: PALETTE.textGray, marginTop: 4, fontWeight: "500" },
  
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFF0F2", borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: PALETTE.accentCoral },
  errorText: { color: PALETTE.accentCoral, fontSize: 13, fontWeight: "600", flex: 1 },
  
  form: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "700", color: PALETTE.textDark, marginBottom: 8, marginLeft: 4 },
  inputContainerModern: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.inputBorder,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    gap: 12,
  },
  inputModern: { flex: 1, fontSize: 15, color: PALETTE.textDark, fontWeight: "500" },
  
  forgotBtn: { alignSelf: "flex-end", marginTop: -10, marginBottom: 16 },
  forgotText: { color: PALETTE.accentCoral, fontSize: 13, fontWeight: "700" },
  
  feedbackBox: { borderRadius: 12, padding: 12, marginBottom: 16 },
  feedbackSuccess: { backgroundColor: "#EDF9F2", borderLeftWidth: 4, borderLeftColor: "#2E7D4D" },
  feedbackError: { backgroundColor: "#FFF0F2", borderLeftWidth: 4, borderLeftColor: PALETTE.accentCoral },
  feedbackSuccessText: { color: "#2E7D4D", fontSize: 13 },
  feedbackErrorText: { color: PALETTE.accentCoral, fontSize: 13 },
  
  btnPrimary: { 
    backgroundColor: PALETTE.primaryDark, 
    borderRadius: 100, 
    height: 54, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: PALETTE.primaryDark, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4 
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: PALETTE.white, fontSize: 16, fontWeight: "800" },
  
  separator: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: PALETTE.inputBorder },
  separatorText: { fontSize: 13, color: PALETTE.textGray, fontWeight: "600" },
  
  btnGoogle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: PALETTE.white, borderWidth: 1.5, borderColor: PALETTE.inputBorder, borderRadius: 100, height: 54 },
  googleIcon: { fontSize: 20, fontWeight: "900", color: "#4285F4" },
  btnGoogleText: { fontSize: 15, fontWeight: "600", color: PALETTE.textDark },
  
  linkBtn: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14, color: PALETTE.textGray },
  linkAccent: { color: PALETTE.accentCoral, fontWeight: "800" },
});

================================================
📄 ARCHIVO: app\(auth)\register.tsx
================================================

import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";

// 🎨 Paleta de colores unificada "Pet & Nature"
const PALETTE = {
  background: "#FFFBF0",      
  white: "#FFFFFF",
  textDark: "#1A1A1A",      
  textMain: "#222222",      
  textLight: "#717171",     
  primaryGreen: "#006B54",  
  primaryLight: "#D9EBE6",  // Verde suave para selección
  inputBackground: "#FEFDFB",
  inputBorder: "#EBEBEB",   
  inputIcon: "#9A9A9A",     
  accentCoral: "#A86A5A",   
  errorBackground: "#FFF0F2",
};

type Role = "adopter" | "shelter";

export default function RegisterScreen() {
  const [role, setRole] = useState<Role>("adopter");
  
  // Estados compartidos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados Adoptante
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [experience, setExperience] = useState<string>("first"); // first, previous, current
  const [phone, setPhone] = useState("");
  const [homeDescription, setHomeDescription] = useState("");
  const [adopterTerms, setAdopterTerms] = useState(false);

  // Estados Refugio
  const [shelterName, setShelterName] = useState("");
  const [shelterId, setShelterId] = useState("");
  const [address, setAddress] = useState("");
  const [shelterPhone, setShelterPhone] = useState("");
  const [shelterTerms, setShelterTerms] = useState(false);

  const { register, isLoading, error } = useAuth();

  const handleRegister = () => {
    // Aquí puedes adaptar lo que envías según el rol
    const usernameToSend = role === "adopter" ? fullName : shelterName;
    
    // Validación básica de términos
    if (role === 'adopter' && !adopterTerms) {
       alert("Debes certificar la información para continuar.");
       return;
    }
    if (role === 'shelter' && !shelterTerms) {
       alert("Debes aceptar los Términos de Servicio para continuar.");
       return;
    }

    register({ 
      email, 
      password, 
      username: usernameToSend || "Usuario", 
      role 
    });
  };

  const renderAdopterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionHeader}>Tu viaje comienza aquí</Text>
      <Text style={styles.sectionSubHeader}>Completa tu perfil para que podamos ayudarte a encontrar a tu compañero ideal.</Text>

      <Text style={styles.inputLabel}>Nombre Completo</Text>
      <View style={styles.inputContainerModern}>
        <TextInput
          style={styles.inputModern}
          placeholder="Ej: Ana María García"
          placeholderTextColor={PALETTE.inputIcon}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <Text style={styles.inputLabel}>Cédula / ID</Text>
      <View style={styles.inputContainerModern}>
        <TextInput
          style={styles.inputModern}
          placeholder="Ej: 12.345.678"
          placeholderTextColor={PALETTE.inputIcon}
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.inputLabel}>Ocupación / Profesión</Text>
      <View style={styles.inputContainerModern}>
        <TextInput
          style={styles.inputModern}
          placeholder="¿A qué te dedicas?"
          placeholderTextColor={PALETTE.inputIcon}
          value={occupation}
          onChangeText={setOccupation}
        />
      </View>

      <Text style={styles.inputLabel}>Experiencia con mascotas</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity 
          style={[styles.radioOption, experience === 'first' && styles.radioOptionActive]}
          onPress={() => setExperience('first')}
        >
          <IconSymbol name={experience === 'first' ? "circle.inset.filled" : "circle"} color={experience === 'first' ? PALETTE.primaryGreen : PALETTE.inputBorder} size={20} />
          <Text style={styles.radioText}>Es mi primera mascota</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.radioOption, experience === 'previous' && styles.radioOptionActive]}
          onPress={() => setExperience('previous')}
        >
          <IconSymbol name={experience === 'previous' ? "circle.inset.filled" : "circle"} color={experience === 'previous' ? PALETTE.primaryGreen : PALETTE.inputBorder} size={20} />
          <Text style={styles.radioText}>He tenido mascotas anteriormente</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.radioOption, experience === 'current' && styles.radioOptionActive]}
          onPress={() => setExperience('current')}
        >
          <IconSymbol name={experience === 'current' ? "circle.inset.filled" : "circle"} color={experience === 'current' ? PALETTE.primaryGreen : PALETTE.inputBorder} size={20} />
          <Text style={styles.radioText}>Actualmente tengo otras mascotas</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Teléfono Móvil</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="phone" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="+593 99 000 0000"
          placeholderTextColor={PALETTE.inputIcon}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.inputLabel}>Correo Electrónico</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="envelope" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="tu@ejemplo.com"
          placeholderTextColor={PALETTE.inputIcon}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.inputLabel}>Contraseña</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="lock" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="Crea una contraseña segura"
          placeholderTextColor={PALETTE.inputIcon}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true} 
        />
      </View>

      <Text style={styles.inputLabel}>Cuéntanos sobre tu hogar</Text>
      <View style={[styles.inputContainerModern, styles.textAreaContainer]}>
        <TextInput
          style={[styles.inputModern, styles.textArea]}
          placeholder="Describe brevemente el entorno donde viviría la mascota (casa, departamento, jardín...)"
          placeholderTextColor={PALETTE.inputIcon}
          value={homeDescription}
          onChangeText={setHomeDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={styles.checkboxRow} 
        onPress={() => setAdopterTerms(!adopterTerms)}
        activeOpacity={0.7}
      >
        <View style={[
            styles.checkboxBox, 
            adopterTerms && styles.checkboxBoxActive
        ]}>
            {adopterTerms && <IconSymbol name="checkmark" color={PALETTE.white} size={14} />}
        </View>
        <Text style={styles.checkboxText}>
          Certifico que la información proporcionada es verdadera y acepto el compromiso de cuidado responsable.
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderShelterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionHeader}>Une tu refugio a nuestra red</Text>
      <Text style={styles.sectionSubHeader}>Ayúdanos a conectar más patitas con sus hogares definitivos. Tu labor es fundamental.</Text>

      <Text style={styles.inputLabel}>Nombre del Refugio</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="building.2" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="Ej. Refugio Huellas Felices"
          placeholderTextColor={PALETTE.inputIcon}
          value={shelterName}
          onChangeText={setShelterName}
        />
      </View>

      <Text style={styles.inputLabel}>NIT / Identificación</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="doc.text" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="900.123.456-7"
          placeholderTextColor={PALETTE.inputIcon}
          value={shelterId}
          onChangeText={setShelterId}
        />
      </View>

      <Text style={styles.inputLabel}>Dirección</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="mappin.and.ellipse" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="Calle 123 #45-67, Ciudad"
          placeholderTextColor={PALETTE.inputIcon}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <Text style={styles.inputLabel}>Teléfono</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="phone" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="+593 900 000 0000"
          placeholderTextColor={PALETTE.inputIcon}
          value={shelterPhone}
          onChangeText={setShelterPhone}
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.inputLabel}>Correo Electrónico</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="envelope" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="contacto@refugio.com"
          placeholderTextColor={PALETTE.inputIcon}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.inputLabel}>Contraseña</Text>
      <View style={styles.inputContainerModern}>
        <IconSymbol name="lock" color={PALETTE.textDark} size={18} />
        <TextInput
          style={styles.inputModern}
          placeholder="Crea una contraseña segura"
          placeholderTextColor={PALETTE.inputIcon}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true} 
        />
      </View>

      <TouchableOpacity 
        style={styles.checkboxRow} 
        onPress={() => setShelterTerms(!shelterTerms)}
        activeOpacity={0.7}
      >
        <View style={[
            styles.checkboxBox, 
            shelterTerms && styles.checkboxBoxActive
        ]}>
            {shelterTerms && <IconSymbol name="checkmark" color={PALETTE.white} size={14} />}
        </View>
        <Text style={styles.checkboxText}>
          Acepto los <Text style={styles.linkAccentGreen}>Términos de Servicio</Text> y la <Text style={styles.linkAccentGreen}>Política de Privacidad</Text> de PetAdopt.
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Animado */}
        <View style={styles.header}>
          <LottieView
            source={require("../../assets/animations/pets.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>PetAdopt</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <View style={styles.errorHeader}>
              <IconSymbol name="exclamationmark.triangle.fill" color={PALETTE.accentCoral} size={16} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        )}

        {/* Selector de Rol */}
        <Text style={styles.roleLabel}>¿Cómo quieres usar PetAdopt?</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.roleCard, role === "adopter" && styles.roleCardActiveGreen]}
            onPress={() => setRole("adopter")}
          >
            {role === "adopter" && (
              <View style={styles.roleCheck}>
                <IconSymbol name="checkmark" color={PALETTE.primaryGreen} size={12} />
              </View>
            )}
            <IconSymbol name="pawprint.fill" color={role === "adopter" ? PALETTE.primaryGreen : PALETTE.inputIcon} size={28} />
            <Text style={[styles.roleCardTitle, role === "adopter" && { color: PALETTE.primaryGreen }]}>
              ADOPTANTE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.roleCard, role === "shelter" && styles.roleCardActiveGreen]}
            onPress={() => setRole("shelter")}
          >
            {role === "shelter" && (
              <View style={styles.roleCheck}>
                <IconSymbol name="checkmark" color={PALETTE.primaryGreen} size={12} />
              </View>
            )}
            <IconSymbol name="building.2.fill" color={role === "shelter" ? PALETTE.primaryGreen : PALETTE.inputIcon} size={28} />
            <Text style={[styles.roleCardTitle, role === "shelter" && { color: PALETTE.primaryGreen }]}>
              REFUGIO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario Dinámico envuelto en Tarjeta Blanca */}
        <View style={styles.whiteCard}>
          {role === "adopter" ? renderAdopterForm() : renderShelterForm()}

          {/* Botón Submit */}
          <TouchableOpacity
            style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
            disabled={isLoading}
            activeOpacity={0.85}
            onPress={handleRegister}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.btnPrimaryText}>{role === "adopter" ? "Finalizar Registro" : "Crear cuenta"}</Text>
                <IconSymbol name="arrow.right" color={PALETTE.white} size={18} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Link login */}
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.linkAccent}>Inicia sesión aquí</Text>
            </Text>
          </TouchableOpacity>
        </Link>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: PALETTE.background },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: { alignItems: "center", marginBottom: 5 },
  lottie: { width: 100, height: 100 },
  title: { fontSize: 24, fontWeight: "800", color: PALETTE.primaryGreen, marginTop: -10, marginBottom: 10 },

  errorBox: {
    backgroundColor: PALETTE.errorBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFDDE2",
  },
  errorHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  errorText: { color: PALETTE.accentCoral, fontSize: 13, fontWeight: "600", flex: 1 },

  roleLabel: {
    fontSize: 14,
    color: PALETTE.textMain,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PALETTE.inputBorder,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    backgroundColor: PALETTE.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  roleCardActiveGreen: {
    borderColor: PALETTE.primaryGreen,
    backgroundColor: PALETTE.primaryLight,
  },
  roleCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PALETTE.white,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCardTitle: { fontSize: 12, fontWeight: "800", color: PALETTE.inputIcon, marginTop: 8 },

  whiteCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  formContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "900",
    color: PALETTE.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  sectionSubHeader: {
    fontSize: 14,
    color: PALETTE.textLight,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: PALETTE.textMain,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainerModern: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.inputBorder,
    paddingHorizontal: 16,
    minHeight: 52, 
    marginBottom: 16,
    gap: 10,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  inputModern: { 
    flex: 1, 
    fontSize: 14, 
    color: PALETTE.textMain,
    fontWeight: "500",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  radioGroup: {
    gap: 8,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: PALETTE.inputBorder,
    borderRadius: 12,
    gap: 10,
  },
  radioOptionActive: {
    borderColor: PALETTE.primaryGreen,
    backgroundColor: PALETTE.primaryLight,
  },
  radioText: {
    fontSize: 14,
    color: PALETTE.textMain,
    fontWeight: "500",
  },

  // ESTILO PARA EL CHECKBOX (El recuadro que faltaba)
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: PALETTE.inputIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: PALETTE.primaryGreen,
    borderColor: PALETTE.primaryGreen,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: PALETTE.textLight,
    lineHeight: 18,
  },
  linkAccentGreen: {
    color: PALETTE.primaryGreen,
    fontWeight: '700',
  },

  btnPrimary: {
    backgroundColor: PALETTE.primaryGreen, 
    borderRadius: 100,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PALETTE.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.7, shadowOpacity: 0.1 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  linkBtn: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14, color: PALETTE.textLight, fontWeight: "500" },
  linkAccent: { color: "#C62828", fontWeight: "800" }, 
});

================================================
📄 ARCHIVO: app\(auth)\_layout.tsx
================================================

import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

================================================
📄 ARCHIVO: app\auth\callback.tsx
================================================

import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LottieError from "../../assets/animations/e598df70-1153-11ee-99a5-af0fb90d62d0.json"; // O la ruta que corresponda
import LottieDog from "../../assets/animations/tu-perrito.json";
import { buildSafeNextPath } from "../../src/features/auth/presentation/utils/authRedirect";
import { supabase } from "../../src/shared/infrastructure/supabase/client";

const CORAL = "#A86A5A";

export default function AuthCallback() {
  const router = useRouter();
  const { code, flow, next } = useLocalSearchParams<{
    code?: string;
    flow?: string;
    next?: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);

  const nextPath = useMemo(() => buildSafeNextPath(next), [next]);
  const authFlow = flow === "recovery" || flow === "confirmation" ? flow : null;

  useEffect(() => {
    let isMounted = true;

    const exchangeCode = async () => {
      if (!code || Array.isArray(code)) {
        return;
      }

      setIsExchanging(true);
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!isMounted) {
        return;
      }

      if (exchangeError) {
        setError(exchangeError.message);
      }

      setIsExchanging(false);
    };

    exchangeCode();

    return () => {
      isMounted = false;
    };
  }, [code]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || authFlow === "recovery") {
        router.replace(
          `/auth/reset-password?next=${encodeURIComponent(nextPath)}`,
        );
        return;
      }

      if (event === "SIGNED_IN" && authFlow === "confirmation") {
        router.replace(
          `/auth/confirm-account?next=${encodeURIComponent(nextPath)}`,
        );
        return;
      }

      if (event === "SIGNED_IN") {
        router.replace("/(app)");
        return;
      }

      if (session) {
        router.replace("/(app)");
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, [authFlow, nextPath, router]);

  if (error) {
    return (
      <View style={styles.container}>
        <LottieView
          autoPlay
          loop
          source={LottieError}
          style={styles.lottieError}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.link}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        loop
        source={LottieDog}
        style={styles.lottieLoading}
      />
      <Text style={styles.loadingText}>
        {isExchanging ? "Validando sesión segura..." : "Verificando enlace..."}
      </Text>
      <ActivityIndicator style={{ marginTop: 12 }} color="#717171" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFAF8",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#717171",
  },
  errorText: {
    fontSize: 15,
    color: CORAL,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
    fontWeight: "500",
  },
  link: {
    fontSize: 14,
    color: "#7D9BAB",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  lottieLoading: {
    width: 150,
    height: 150,
  },
  lottieError: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
});


================================================
📄 ARCHIVO: app\auth\confirm-account.tsx
================================================

import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LottieDog from "../../assets/animations/tu-perrito.json";
import { buildSafeNextPath } from "../../src/features/auth/presentation/utils/authRedirect";

const CORAL = "#A86A5A";
const TEAL = "#0F6966";

export default function ConfirmAccountScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const nextPath = useMemo(() => buildSafeNextPath(next), [next]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(nextPath);
    }, 2400);

    return () => clearTimeout(timer);
  }, [nextPath, router]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Cuenta verificada</Text>
        </View>

        <LottieView
          autoPlay
          loop={false}
          source={LottieDog}
          style={styles.lottie}
        />

        <Text style={styles.title}>Tu cuenta ya está lista</Text>
        <Text style={styles.subtitle}>
          Ya puedes volver al acceso o continuar con tu siguiente paso.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace(nextPath)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Ir al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFAF8",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#E8F7F5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: {
    color: TEAL,
    fontWeight: "700",
    fontSize: 12,
  },
  lottie: {
    width: 180,
    height: 180,
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 22,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryButtonText: {
    color: CORAL,
    fontSize: 15,
    fontWeight: "700",
  },
});


================================================
📄 ARCHIVO: app\auth\index.tsx
================================================

import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TEAL = "#0F6966";
const CORAL = "#A86A5A";

export default function AuthLandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.card}>
        <View style={styles.kicker}>
          <Text style={styles.kickerText}>Sitio auxiliar de autenticación</Text>
        </View>

        <Text style={styles.title}>
          Confirmación y reseteo, en un solo lugar
        </Text>
        <Text style={styles.subtitle}>
          Este espacio puede desplegarse en Vercel, Railway o Render para
          manejar enlaces de cuenta, recuperación y redirecciones
          personalizadas.
        </Text>

        <TouchableOpacity
          style={[styles.cta, styles.ctaPrimary]}
          onPress={() => router.push("/auth/confirm-account?next=/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaPrimaryText}>Página de confirmación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cta, styles.ctaSecondary]}
          onPress={() => router.push("/auth/reset-password?next=/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaSecondaryText}>Formulario de reseteo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.replace("/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.linkButtonText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featureRow}>
        <View style={styles.featureCard}>
          <Text style={styles.featureValue}>Cuenta</Text>
          <Text style={styles.featureLabel}>
            confirmada con estado visible y CTA final
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureValue}>Reset</Text>
          <Text style={styles.featureLabel}>
            cambio de contraseña con redirect seguro
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFAF8",
    padding: 24,
    justifyContent: "center",
  },
  glowTop: {
    position: "absolute",
    top: -80,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(15, 105, 102, 0.12)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -60,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(168, 106, 90, 0.14)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 6,
  },
  kicker: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F7F5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  kickerText: {
    color: TEAL,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    color: "#132029",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    marginBottom: 22,
  },
  cta: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  ctaPrimary: {
    backgroundColor: TEAL,
  },
  ctaSecondary: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  ctaSecondaryText: {
    color: CORAL,
    fontSize: 16,
    fontWeight: "800",
  },
  linkButton: {
    alignSelf: "center",
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: "#64748B",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  featureRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  featureValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#132029",
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
});


================================================
📄 ARCHIVO: app\auth\reset-password.tsx
================================================

/**
 * CAPA: Presentación
 * Pantalla para ingresar nueva contraseña luego del link de recuperación.
 * Solo se accede desde app/auth/callback.tsx (evento PASSWORD_RECOVERY).
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";
import { useAuthStore } from "../../src/features/auth/presentation/store/authStore";
import { buildSafeNextPath } from "../../src/features/auth/presentation/utils/authRedirect";
import { supabase } from "../../src/shared/infrastructure/supabase/client";

const CORAL = "#A86A5A";

export default function ResetPasswordScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const nextPath = useMemo(() => buildSafeNextPath(next), [next]);

  const handleUpdate = async () => {
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verificamos que haya una sesión antes de intentar actualizar
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("La sesión no es válida o ha expirado.");

      // 2. Actualizamos
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      setDone(true);

      // 3. Opcional: Cerramos sesión después de actualizar para forzar login
      await supabase.auth.signOut();
      setUser(null);

      setTimeout(() => router.replace(nextPath), 2000);
    } catch (e: any) {
      console.error("Error en reset:", e);
      setError(e.message ?? "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };
  if (done) {
    return (
      <View style={styles.center}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successText}>¡Contraseña actualizada!</Text>
        <Text style={styles.hint}>Redirigiendo...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa y confirma tu nueva contraseña.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              color={CORAL}
              size={16}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <IconSymbol name="lock.fill" color="#9A9A9A" size={18} />
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputWrapper}>
          <IconSymbol name="lock.fill" color="#9A9A9A" size={18} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Actualizar contraseña</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FCFAF8" },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCFAF8",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#222", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#717171", marginBottom: 28 },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successText: { fontSize: 20, fontWeight: "700", color: "#2E7D4D" },
  hint: { fontSize: 13, color: "#717171", marginTop: 8 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: CORAL, fontSize: 13, flex: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#DDD",
    paddingVertical: 14,
    gap: 12,
    marginBottom: 8,
  },
  input: { flex: 1, fontSize: 16, color: "#222" },
  btn: {
    backgroundColor: CORAL,
    borderRadius: 100,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});


================================================
📄 ARCHIVO: app\_layout.tsx
================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@shared/infrastructure/supabase/client';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Primero verificar si ya existe sesión activa
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const u = await authRepo.getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
      setIsReady(true);
    });

    // Escuchar cambios de sesión en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') return; // lo maneja auth/callback
        if (session) {
          const u = await authRepo.getCurrentUser();
          setUser(u);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const inAuth = segments[0] === '(auth)';
    const inCallback = segments[0] === 'auth';
    if (!user && !inAuth && !inCallback) router.replace('/(auth)/login');
    if (user  && inAuth) router.replace('/(app)');
  }, [user, segments, isReady]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}


================================================
📄 ARCHIVO: app.json
================================================

{
  "expo": {
    "name": "ExamenTemplate",
    "slug": "examen-template",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "examenapp",
    "userInterfaceStyle": "automatic",
    "ios": {
      "supportsTablet": true,
      "config": {
        "googleMapsApiKey": "AIzaSyAbSCsWkVdx5ewXpvnEjfqpPN5i4ki1IHA"
      }
    },
    "android": {
      "package": "com.petadopt.template",
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "config": {
        "googleMaps": {
          "apiKey": "TU_API_KEY_AQUI"
        }
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-secure-store",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Necesitamos tu ubicación para mostrar tu posición en el mapa."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}


================================================
📄 ARCHIVO: CLAUDE.md
================================================

@AGENTS.md


================================================
📄 ARCHIVO: components\external-link.tsx
================================================

import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}


================================================
📄 ARCHIVO: components\haptic-tab.tsx
================================================

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}


================================================
📄 ARCHIVO: components\hello-wave.tsx
================================================

import Animated from 'react-native-reanimated';

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}


================================================
📄 ARCHIVO: components\parallax-scroll-view.tsx
================================================

import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});


================================================
📄 ARCHIVO: components\themed-text.tsx
================================================

import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});


================================================
📄 ARCHIVO: components\themed-view.tsx
================================================

import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}


================================================
📄 ARCHIVO: components\ui\collapsible.tsx
================================================

import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});


================================================
📄 ARCHIVO: components\ui\icon-symbol.ios.tsx
================================================

import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}


================================================
📄 ARCHIVO: components\ui\icon-symbol.tsx
================================================

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill":                           "home",
  "building.2.fill":                  "business",
  "paperplane.fill":                      "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right":                        "chevron-right",
  "cart.fill":                            "shopping-cart",
  "bag.fill":                             "storefront",
  "message.fill":                         "chat",
  "photo.fill":                           "photo-camera",
  "camera.fill":                          "photo-camera",
  "person.fill":                          "person",
  "envelope.fill":                        "email",
  "lock.fill":                            "lock",
  "location.fill":                        "my-location",
  "map.fill":                             "map",
  xmark:                                  "close",
  plus:                                   "add",
  checkmark:                              "check",
  "checkmark.circle":                     "check-circle",
  "exclamationmark.triangle.fill":        "warning",

  // 🔥 Íconos nuevos que agregamos para tu app:
  "pawprint.fill":                        "pets",
  "heart.fill":                           "favorite",
  "magnifyingglass":                      "search",
  "square.and.pencil":                    "edit",
  "pencil":                               "edit",
  "trash": "delete",

  "trash.fill":                           "delete",
  "info.circle":                          "info",
  "info.circle.fill":                     "info",
  "doc.text":                             "description",
  "heart.text.square":                    "health-and-safety",
  "heart.text.square.fill":               "health-and-safety",
  "checkmark.circle.fill":                "check-circle",
  "xmark.circle.fill":                    "cancel",
  "camera.viewfinder":                    "photo-camera",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}


================================================
📄 ARCHIVO: constants\theme.ts
================================================

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});


================================================
📄 ARCHIVO: eslint.config.js
================================================

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);


================================================
📄 ARCHIVO: expo-env.d.ts
================================================

/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore

================================================
📄 ARCHIVO: hooks\use-color-scheme.ts
================================================

export { useColorScheme } from 'react-native';


================================================
📄 ARCHIVO: hooks\use-color-scheme.web.ts
================================================

import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}


================================================
📄 ARCHIVO: hooks\use-theme-color.ts
================================================

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}


================================================
📄 ARCHIVO: package.json
================================================

{
  "name": "examen-template",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build:web": "npx expo export -p web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@gorhom/bottom-sheet": "^5.1.6",
    "@lottiefiles/dotlottie-react": "^0.13.5",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@supabase/supabase-js": "^2.106.1",
    "@tanstack/react-query": "^5.100.13",
    "appwrite": "^25.2.0",
    "base64-arraybuffer": "^1.0.2",
    "expo": "~54.0.33",
    "expo-auth-session": "~7.0.11",
    "expo-constants": "~18.0.13",
    "expo-file-system": "~19.0.23",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-image-picker": "~17.0.11",
    "expo-linking": "~8.0.11",
    "expo-location": "~18.1.5",
    "expo-router": "~6.0.23",
    "expo-secure-store": "~15.0.8",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "lottie-react-native": "~7.3.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-url-polyfill": "^3.0.0",
    "react-native-web": "~0.21.0",
    "react-native-webview": "13.15.0",
    "react-native-worklets": "0.5.1",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true
}


================================================
📄 ARCHIVO: scripts\reset-project.js
================================================

#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /app, /components, /hooks, /scripts, and /constants directories to /app-example based on user input and creates a new /app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
const exampleDir = "app-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the app-example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to new app-example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create new /app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /app directory created.");

    // Create index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 app/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);


================================================
📄 ARCHIVO: src\constants\colors.ts
================================================

// Semantic color tokens for the app
export const PRIMARY_SHELTER = "#A86A5A"; // Primary accent (refugio)
export const SECONDARY_GRADIENT = "#E5C3B4"; // Secondary gradient accent
export const BACKGROUND = "#FFFDFB"; // Neutral background
export const SURFACE = "#FFFFFF"; // Cards and surfaces
export const TEXT_MAIN = "#111827"; // Main text
export const TEXT_SECONDARY = "#6B7280"; // Secondary text
export const BORDER = "#E6E6E6"; // Borders
export const ADOPTER_TINT = "rgba(125,155,171,0.18)"; // adoptante tint (soft)
export const PRIMARY_GRADIENT_START = PRIMARY_SHELTER;
export const PRIMARY_GRADIENT_END = SECONDARY_GRADIENT;
export const PRIMARY_BUTTON_ALPHA_BG = "rgba(168,106,90,0.08)";
export const RADIUS = 10; // default corner radius


================================================
📄 ARCHIVO: src\features\adoptionRequests\application\use-cases\CancelAdoptionRequestUseCase.ts
================================================

import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class CancelAdoptionRequestUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(requestId: string): Promise<void> {
    if (!requestId) {
      throw new Error('ID de solicitud inválido');
    }
    return this.requestsRepo.cancelRequest(requestId);
  }
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\application\use-cases\CreateAdoptionRequestUseCase.ts
================================================

import { AdoptionRequest, CreateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class CreateAdoptionRequestUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(input: CreateAdoptionRequestInput, adopterId: string, shelterId: string): Promise<AdoptionRequest> {
    if (!input.petId) {
      throw new Error('ID de mascota requerido');
    }

    // Verificar si ya existe una solicitud no resuelta
    const hasExisting = await this.requestsRepo.hasExistingRequest(input.petId, adopterId);
    if (hasExisting) {
      throw new Error('Ya tienes una solicitud pendiente para esta mascota');
    }

    return this.requestsRepo.createRequest(input, adopterId, shelterId);
  }
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\application\use-cases\GetAdopterRequestsUseCase.ts
================================================

import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class GetAdopterRequestsUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(adopterId: string): Promise<AdoptionRequest[]> {
    if (!adopterId) {
      throw new Error('ID de adoptante inválido');
    }
    return this.requestsRepo.getAdopterRequests(adopterId);
  }
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\application\use-cases\GetShelterRequestsUseCase.ts
================================================

import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class GetShelterRequestsUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(shelterId: string): Promise<AdoptionRequest[]> {
    if (!shelterId) {
      throw new Error('ID de refugio inválido');
    }
    return this.requestsRepo.getShelterRequests(shelterId);
  }
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\application\use-cases\UpdateAdoptionRequestUseCase.ts
================================================

import { AdoptionRequest, UpdateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class UpdateAdoptionRequestUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(requestId: string, input: UpdateAdoptionRequestInput): Promise<AdoptionRequest> {
    if (!requestId) {
      throw new Error('ID de solicitud inválido');
    }
    return this.requestsRepo.updateRequest(requestId, input);
  }
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\domain\entities\AdoptionRequest.ts
================================================

export type AdoptionRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AdoptionRequest {
  id: string;
  petId: string;
  adopterId: string;
  shelterId: string;
  status: AdoptionRequestStatus;
  message?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdoptionRequestInput {
  petId: string;
  message?: string;
}

export interface UpdateAdoptionRequestInput {
  status?: AdoptionRequestStatus;
  rejectionReason?: string;
}

// Para combinar con datos de la mascota
export interface AdoptionRequestWithPet extends AdoptionRequest {
  petName: string;
  petImage?: string;
  adopterName: string;
  shelterName: string;
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\domain\repositories\IAdoptionRequestsRepository.ts
================================================

import { AdoptionRequest, CreateAdoptionRequestInput, UpdateAdoptionRequestInput } from '../entities/AdoptionRequest';

export interface IAdoptionRequestsRepository {
  // Obtener solicitudes del adoptante
  getAdopterRequests(adopterId: string): Promise<AdoptionRequest[]>;
  
  // Obtener solicitudes recibidas por el refugio
  getShelterRequests(shelterId: string): Promise<AdoptionRequest[]>;
  
  // Obtener solicitudes para una mascota específica
  getPetRequests(petId: string): Promise<AdoptionRequest[]>;
  
  // Obtener detalle de una solicitud
  getRequestById(requestId: string): Promise<AdoptionRequest | null>;
  
  // Crear solicitud de adopción
  createRequest(input: CreateAdoptionRequestInput, adopterId: string, shelterId: string): Promise<AdoptionRequest>;
  
  // Actualizar estado de solicitud
  updateRequest(requestId: string, input: UpdateAdoptionRequestInput): Promise<AdoptionRequest>;
  
  // Cancelar solicitud (solo adoptante)
  cancelRequest(requestId: string): Promise<void>;
  
  // Verificar si hay solicitud existente no resuelta
  hasExistingRequest(petId: string, adopterId: string): Promise<boolean>;
  
  // Suscribirse a cambios en solicitudes del refugio
  subscribeToShelterRequests(shelterId: string, onRequestsChange: (requests: AdoptionRequest[]) => void): () => void;
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\infrastructure\repositories\SupabaseAdoptionRequestsRepository.ts
================================================

import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { AdoptionRequest, CreateAdoptionRequestInput, UpdateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class SupabaseAdoptionRequestsRepository implements IAdoptionRequestsRepository {
  
  async getAdopterRequests(adopterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('adopter_id', adopterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener solicitudes: ${error.message}`);
    return (data || []).map(this.mapRequest);
  }

  async getShelterRequests(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener solicitudes del refugio: ${error.message}`);
    return (data || []).map(this.mapRequest);
  }

  async getPetRequests(petId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener solicitudes de mascota: ${error.message}`);
    return (data || []).map(this.mapRequest);
  }

  async getRequestById(requestId: string): Promise<AdoptionRequest | null> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener solicitud: ${error.message}`);
    }

    return data ? this.mapRequest(data) : null;
  }

  async createRequest(
    input: CreateAdoptionRequestInput,
    adopterId: string,
    shelterId: string
  ): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({
        pet_id: input.petId,
        adopter_id: adopterId,
        shelter_id: shelterId,
        message: input.message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear solicitud: ${error.message}`);
    return this.mapRequest(data);
  }

  async updateRequest(requestId: string, input: UpdateAdoptionRequestInput): Promise<AdoptionRequest> {
    const updateData: any = {};
    
    if (input.status !== undefined) updateData.status = input.status;
    if (input.rejectionReason !== undefined) updateData.rejection_reason = input.rejectionReason;

    const { data, error } = await supabase
      .from('adoption_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar solicitud: ${error.message}`);
    return this.mapRequest(data);
  }

  async cancelRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('adoption_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    if (error) throw new Error(`Error al cancelar solicitud: ${error.message}`);
  }

  async hasExistingRequest(petId: string, adopterId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('id', { count: 'exact', head: true })
      .eq('pet_id', petId)
      .eq('adopter_id', adopterId)
      .neq('status', 'rejected')
      .neq('status', 'cancelled');

    if (error) throw new Error(`Error al verificar solicitud: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  subscribeToShelterRequests(
    shelterId: string,
    onRequestsChange: (requests: AdoptionRequest[]) => void
  ): () => void {
    const subscription = supabase
      .channel(`shelter:${shelterId}:requests`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'adoption_requests',
          filter: `shelter_id=eq.${shelterId}`,
        },
        async () => {
          const requests = await this.getShelterRequests(shelterId);
          onRequestsChange(requests);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  private mapRequest(data: any): AdoptionRequest {
    return {
      id: data.id,
      petId: data.pet_id,
      adopterId: data.adopter_id,
      shelterId: data.shelter_id,
      status: data.status,
      message: data.message,
      rejectionReason: data.rejection_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}


================================================
📄 ARCHIVO: src\features\adoptionRequests\presentation\hooks\useAdoptionRequests.ts
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CancelAdoptionRequestUseCase } from '../../application/use-cases/CancelAdoptionRequestUseCase';
import { CreateAdoptionRequestUseCase } from '../../application/use-cases/CreateAdoptionRequestUseCase';
import { GetAdopterRequestsUseCase } from '../../application/use-cases/GetAdopterRequestsUseCase';
import { GetShelterRequestsUseCase } from '../../application/use-cases/GetShelterRequestsUseCase';
import { UpdateAdoptionRequestUseCase } from '../../application/use-cases/UpdateAdoptionRequestUseCase';
import { AdoptionRequest, CreateAdoptionRequestInput, UpdateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { SupabaseAdoptionRequestsRepository } from '../../infrastructure/repositories/SupabaseAdoptionRequestsRepository';

const requestsRepo = new SupabaseAdoptionRequestsRepository();
const createRequestUseCase = new CreateAdoptionRequestUseCase(requestsRepo);
const getAdopterRequestsUseCase = new GetAdopterRequestsUseCase(requestsRepo);
const getShelterRequestsUseCase = new GetShelterRequestsUseCase(requestsRepo);
const updateRequestUseCase = new UpdateAdoptionRequestUseCase(requestsRepo);
const cancelRequestUseCase = new CancelAdoptionRequestUseCase(requestsRepo);

export function useAdoptionRequests() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Obtener solicitudes del adoptante
  const {
    data: adopterRequests = [],
    isLoading: isLoadingAdopterRequests,
    error: errorAdopterRequests,
  } = useQuery({
    queryKey: ['adoption_requests', 'adopter', user?.id],
    queryFn: () => getAdopterRequestsUseCase.execute(user!.id),
    enabled: !!user && user.role === 'adopter',
  });

  // Obtener solicitudes recibidas por el refugio
  const {
    data: shelterRequests = [],
    isLoading: isLoadingShelterRequests,
    error: errorShelterRequests,
  } = useQuery({
    queryKey: ['adoption_requests', 'shelter', user?.id],
    queryFn: () => getShelterRequestsUseCase.execute(user!.id),
    enabled: !!user && user.role === 'shelter',
  });

  // Crear solicitud de adopción
  const createMutation = useMutation({
    mutationFn: async (input: CreateAdoptionRequestInput & { shelterId: string }) => {
      const { shelterId, petId, message } = input;
      return createRequestUseCase.execute({ petId, message }, user!.id, shelterId);
    },
    onSuccess: (newRequest) => {
      queryClient.setQueryData(['adoption_requests', 'adopter', user?.id], (old: AdoptionRequest[] = []) => [
        newRequest,
        ...old,
      ]);
    },
  });

  // Actualizar solicitud (aprobar/rechazar)
  const updateMutation = useMutation({
    mutationFn: ({ requestId, input }: { requestId: string; input: UpdateAdoptionRequestInput }) =>
      updateRequestUseCase.execute(requestId, input),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(['adoption_requests', 'shelter', user?.id], (old: AdoptionRequest[] = []) =>
        old.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
      );
      queryClient.invalidateQueries({ queryKey: ['adoption_requests', 'adopter'] });
    },
  });

  // Cancelar solicitud
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelRequestUseCase.execute(requestId),
    onSuccess: (_, requestId) => {
      queryClient.setQueryData(['adoption_requests', 'adopter', user?.id], (old: AdoptionRequest[] = []) =>
        old.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' as const } : r))
      );
    },
  });

  return {
    // Solicitudes del adoptante
    adopterRequests,
    isLoadingAdopterRequests,
    errorAdopterRequests: errorAdopterRequests?.message ?? null,

    // Solicitudes del refugio
    shelterRequests,
    isLoadingShelterRequests,
    errorShelterRequests: errorShelterRequests?.message ?? null,

    // Mutaciones
    createRequest: createMutation.mutate,
    createRequestAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,

    updateRequest: updateMutation.mutate,
    updateRequestAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error?.message ?? null,

    cancelRequest: cancelMutation.mutate,
    cancelRequestAsync: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error?.message ?? null,
  };
}


================================================
📄 ARCHIVO: src\features\ai\domain\entities\ChatMessage.ts
================================================

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
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}


================================================
📄 ARCHIVO: src\features\ai\infrastructure\GeminiService.ts
================================================

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


================================================
📄 ARCHIVO: src\features\ai\presentation\hooks\useGeminiChat.ts
================================================

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


================================================
📄 ARCHIVO: src\features\auth\application\use-cases\LoginUseCase.ts
================================================

import { AuthError } from '../../../../shared/domain/errors/AppError';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password)
      throw new AuthError('Email y contraseña son requeridos');
    try {
      return await this.authRepo.login(email, password);
    } catch (error) {
      throw new AuthError('Credenciales inválidas', error);
    }
  }
}

================================================
📄 ARCHIVO: src\features\auth\application\use-cases\LoginWithGoogleUseCase.ts
================================================

import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class LoginWithGoogleUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<User> {
    return this.authRepo.loginWithGoogle();
  }
}


================================================
📄 ARCHIVO: src\features\auth\application\use-cases\RegisterUseCase.ts
================================================

import { AuthError } from "../../../../shared/domain/errors/AppError";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(
    email: string,
    password: string,
    username: string,
    role: "adopter" | "shelter",
    redirectTo?: string,
  ): Promise<User> {
    if (!email || !password || !username)
      throw new AuthError("Todos los campos son requeridos");
    if (password.length < 6)
      throw new AuthError("La contraseña debe tener al menos 6 caracteres");
    if (username.includes(" "))
      throw new AuthError("El username no puede contener espacios");
    if (!["adopter", "shelter"].includes(role))
      throw new AuthError("El rol debe ser adopter o shelter");
    try {
      return await this.authRepo.register(
        email,
        password,
        username,
        role,
        redirectTo,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrar usuario";
      throw new AuthError(message, error);
    }
  }
}


================================================
📄 ARCHIVO: src\features\auth\application\use-cases\ResetPasswordUseCase.ts
================================================

import { AuthError } from "../../../../shared/domain/errors/AppError";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class ResetPasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<void> {
    if (!email) {
      throw new AuthError("El email es requerido");
    }

    if (!email.includes("@")) {
      throw new AuthError("Ingresa un email valido");
    }

    if (!redirectTo) {
      throw new AuthError("La URL de redireccion es requerida");
    }

    try {
      await this.authRepo.resetPassword(email, redirectTo);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar el correo de recuperacion";
      throw new AuthError(message, error);
    }
  }
}


================================================
📄 ARCHIVO: src\features\auth\application\use-cases\UpdateLocationUseCase.ts
================================================

import { AuthError } from '../../../../shared/domain/errors/AppError';
import { UserLocation } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class UpdateLocationUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(userId: string, location: UserLocation): Promise<void> {
    if (!userId) throw new AuthError('Usuario no autenticado');
    if (!location.latitude || !location.longitude)
      throw new AuthError('Coordenadas inválidas');
    return this.authRepo.updateLocation(userId, location);
  }
}


================================================
📄 ARCHIVO: src\features\auth\domain\entities\User.ts
================================================

export type UserRole = 'adopter' | 'shelter';

export interface UserLocation {
  latitude:  number;
  longitude: number;
  address?:  string;
}

export interface User {
  id:         string;
  email:      string;
  username:   string;
  role:       UserRole;
  avatarUrl?: string;
  location?:  UserLocation;
}


================================================
📄 ARCHIVO: src\features\auth\domain\repositories\IAuthRepository.ts
================================================

import { User, UserLocation } from "../entities/User";

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  register(
    email: string,
    password: string,
    username: string,
    role: "adopter" | "shelter",
    redirectTo?: string,
  ): Promise<User>;
  resetPassword(email: string, redirectTo: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateLocation(userId: string, location: UserLocation): Promise<void>;
}


================================================
📄 ARCHIVO: src\features\auth\infrastructure\repositories\SupabaseAuthRepository.ts
================================================

import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserLocation } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { buildNativeAuthCallbackUri } from "../../presentation/utils/authRedirect";

WebBrowser.maybeCompleteAuthSession();

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user)
      throw error ?? new Error("Error al iniciar sesión");
    return this._fetchProfile(data.user.id, data.user.email!);
  }

  async loginWithGoogle(): Promise<User> {
    const redirectTo = buildNativeAuthCallbackUri();
    console.log("👉 NUEVA URL PARA SUPABASE:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) throw error;

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "success" && result.url) {
        const { params, errorCode } = QueryParams.getQueryParams(result.url);

        if (errorCode) throw new Error(errorCode);

        if (params.access_token && params.refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });

          if (sessionError) throw sessionError;
        }
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No se pudo obtener el usuario de Google");

    // ✅ CORRECCIÓN 2: Eliminamos la lógica duplicada que sobreescribía el rol a 'adopter'.
    // Ahora simplemente pedimos que busque el perfil correcto.
    return this._fetchProfile(user.id, user.email!);
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: "adopter" | "shelter",
    redirectTo?: string,
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
          role: role,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("No se pudo crear el usuario");

    return { id: data.user.id, email: data.user.email!, username, role };
  }

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return this._fetchProfile(user.id, user.email!);
  }

  async updateLocation(userId: string, location: UserLocation): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({
        location_lat: location.latitude,
        location_lng: location.longitude,
        location_address: location.address ?? null,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  }

  private async _fetchProfile(userId: string, email: string): Promise<User> {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "full_name, avatar_url, role, location_lat, location_lng, location_address",
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error al consultar perfil:", error);
      throw new Error(`Error de BD al obtener perfil: ${error.message}`);
    }

    if (!profile) {
      console.log("Perfil no encontrado. Creando uno nuevo automáticamente...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const username =
        user?.user_metadata?.full_name?.replace(/\s+/g, "_").toLowerCase() ??
        email.split("@")[0];

      // ✅ CORRECCIÓN 3: Omitimos la propiedad "role" en este upsert.
      // Si la BD ya tenía el rol guardado como 'shelter' por el trigger, no lo sobreescribimos.
      // Si el usuario es nuevo, la BD automáticamente le pondrá 'adopter' por defecto.
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: username,
        avatar_url: user?.user_metadata?.avatar_url ?? null,
      });

      if (upsertError) {
        console.error("🔥 Error crítico al guardar el perfil:", upsertError);
        throw new Error(`Error de BD: ${upsertError.message}`);
      }

      return {
        id: userId,
        email,
        username,
        role: "adopter", // Devolvemos adoptante solo como lectura rápida para esta sesión inicial
        avatarUrl: user?.user_metadata?.avatar_url ?? undefined,
      };
    }

    return {
      id: userId,
      email,
      username: profile.full_name, // Mapeamos al frontend
      role: profile.role as "adopter" | "shelter",
      avatarUrl: profile.avatar_url ?? undefined,
      location: profile.location_lat
        ? {
            latitude: profile.location_lat,
            longitude: profile.location_lng,
            address: profile.location_address ?? undefined,
          }
        : undefined,
    };
  }
}


================================================
📄 ARCHIVO: src\features\auth\presentation\hooks\useAuth.ts
================================================

import { supabase } from "@shared/infrastructure/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { LoginWithGoogleUseCase } from "../../application/use-cases/LoginWithGoogleUseCase";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { UpdateLocationUseCase } from "../../application/use-cases/UpdateLocationUseCase";
import { UserLocation } from "../../domain/entities/User";
import { SupabaseAuthRepository } from "../../infrastructure/repositories/SupabaseAuthRepository";
import { useAuthStore } from "../store/authStore";
import { buildAuthCallbackUrl } from "../utils/authRedirect";

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepo);
const updateLocationUseCase = new UpdateLocationUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/(app)");
    },
  });

  const loginGoogleMutation = useMutation({
    mutationFn: () => loginWithGoogleUseCase.execute(),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      username,
      role,
    }: {
      email: string;
      password: string;
      username: string;
      role: "shelter" | "adopter";
    }) => {
      const redirectTo = buildAuthCallbackUrl("confirmation", "/login");
      return registerUseCase.execute(
        email,
        password,
        username,
        role,
        redirectTo,
      );
    },
    onSuccess: async (u) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(u);
        router.replace("/(app)");
        return;
      }

      router.replace("/auth/confirm-account?next=/login");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => {
      const redirectTo = buildAuthCallbackUrl("recovery", "/login");
      return resetPasswordUseCase.execute(email, redirectTo);
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: (location: UserLocation) =>
      updateLocationUseCase.execute(user!.id, location),
    onSuccess: (_, location) => {
      if (user) setUser({ ...user, location });
    },
  });

  const logout = async () => {
    try {
      await authRepo.logout();
    } finally {
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  return {
    user,
    login: loginMutation.mutate,
    loginWithGoogle: loginGoogleMutation.mutate,
    register: registerMutation.mutate,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateLocation: updateLocationMutation.mutate,
    logout,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      loginGoogleMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingLocation: updateLocationMutation.isPending,
    error:
      loginMutation.error?.message ??
      registerMutation.error?.message ??
      loginGoogleMutation.error?.message ??
      null,
  };
}


================================================
📄 ARCHIVO: src\features\auth\presentation\store\authStore.ts
================================================

import { create } from 'zustand';
import { User } from '../../domain/entities/User';

interface AuthState {
  user:    User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  setUser: (user) => set({ user }),
}));

================================================
📄 ARCHIVO: src\features\auth\presentation\utils\authRedirect.ts
================================================

import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

const DEFAULT_NEXT_PATH = "/login";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getWebBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_AUTH_WEB_URL?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return "http://localhost:8081";
}

function normalizeNextPath(nextPath?: string | null) {
  if (!nextPath) {
    return DEFAULT_NEXT_PATH;
  }

  if (nextPath.startsWith("http://") || nextPath.startsWith("https://")) {
    try {
      const parsedUrl = new URL(nextPath);
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      return DEFAULT_NEXT_PATH;
    }
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return nextPath;
}

export function buildNativeAuthCallbackUri(
  flow?: "confirmation" | "recovery",
  nextPath?: string | null,
) {
  return makeRedirectUri({
    scheme: "examenapp",
    path: "auth/callback",
    queryParams: flow
      ? {
          flow,
          next: normalizeNextPath(nextPath),
        }
      : undefined,
  });
}

export function buildWebAuthCallbackUrl(
  flow: "confirmation" | "recovery",
  nextPath?: string | null,
) {
  const callbackUrl = new URL("/auth/callback", `${getWebBaseUrl()}/`);
  callbackUrl.searchParams.set("flow", flow);
  callbackUrl.searchParams.set("next", normalizeNextPath(nextPath));
  return callbackUrl.toString();
}

export function buildAuthCallbackUrl(
  flow: "confirmation" | "recovery",
  nextPath?: string | null,
) {
  const hasConfiguredWebUrl = Boolean(
    process.env.EXPO_PUBLIC_AUTH_WEB_URL?.trim(),
  );

  if (Platform.OS === "web" || hasConfiguredWebUrl) {
    return buildWebAuthCallbackUrl(flow, nextPath);
  }

  return buildNativeAuthCallbackUri(flow, nextPath);
}

export function buildSafeNextPath(nextPath?: string | null) {
  return normalizeNextPath(nextPath);
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\CreatePetUseCase.ts
================================================

import { CreatePetInput, Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class CreatePetUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(input: CreatePetInput, shelterId: string): Promise<Pet> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('El nombre de la mascota es requerido');
    }
    if (!input.species) {
      throw new Error('La especie de la mascota es requerida');
    }
    if (!input.size) {
      throw new Error('El tamaño de la mascota es requerido');
    }
    if (!input.healthStatus) {
      throw new Error('El estado de salud es requerido');
    }

    return this.petsRepo.createPet(input, shelterId);
  }
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\DeletePetUseCase.ts
================================================

import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class DeletePetUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(petId: string): Promise<void> {
    if (!petId || petId.trim().length === 0) {
      throw new Error('ID de mascota inválido');
    }
    return this.petsRepo.deletePet(petId);
  }
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\GetAvailablePetsUseCase.ts
================================================

import { Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class GetAvailablePetsUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(): Promise<Pet[]> {
    return this.petsRepo.getAvailablePets();
  }
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\GetPetByIdUseCase.ts
================================================

import { Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class GetPetByIdUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(petId: string): Promise<Pet | null> {
    if (!petId || petId.trim().length === 0) {
      throw new Error('ID de mascota inválido');
    }
    return this.petsRepo.getPetById(petId);
  }
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\GetShelterPetsUseCase.ts
================================================

import { Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class GetShelterPetsUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(shelterId: string): Promise<Pet[]> {
    if (!shelterId || shelterId.trim().length === 0) {
      throw new Error('ID de refugio inválido');
    }
    return this.petsRepo.getShelterPets(shelterId);
  }
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\SearchPetsUseCase.ts
================================================

import { Pet, PetFilter } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class SearchPetsUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(filter: PetFilter): Promise<Pet[]> {
    return this.petsRepo.searchPets(filter);
  }
}


================================================
📄 ARCHIVO: src\features\pets\application\use-cases\UpdatePetUseCase.ts
================================================

import { Pet, UpdatePetInput } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class UpdatePetUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(petId: string, input: UpdatePetInput): Promise<Pet> {
    if (!petId || petId.trim().length === 0) {
      throw new Error('ID de mascota inválido');
    }
    return this.petsRepo.updatePet(petId, input);
  }
}


================================================
📄 ARCHIVO: src\features\pets\domain\entities\Pet.ts
================================================

export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
export type PetSize = 'small' | 'medium' | 'large' | 'xlarge';
export type HealthStatus = 'healthy' | 'medical_attention' | 'vaccinated';

export interface Pet {
  id: string;
  shelterId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  ageYears?: number;
  ageMonths?: number;
  size: PetSize;
  weightKg?: number;
  description?: string;
  temperament?: string;
  healthStatus: HealthStatus;
  imageUrl?: string;
  additionalImages?: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetInput {
  name: string;
  species: PetSpecies;
  breed?: string;
  ageYears?: number;
  ageMonths?: number;
  size: PetSize;
  weightKg?: number;
  description?: string;
  temperament?: string;
  healthStatus: HealthStatus;
  imageUri?: string;
}

export interface UpdatePetInput {
  name?: string;
  breed?: string;
  ageYears?: number;
  ageMonths?: number;
  size?: PetSize;
  weightKg?: number;
  description?: string;
  temperament?: string;
  healthStatus?: HealthStatus;
  available?: boolean;
  imageUri?: string;
}

export interface PetFilter {
  species?: PetSpecies;
  size?: PetSize;
  minAge?: number;
  maxAge?: number;
  searchText?: string;
  shelterId?: string;
}


================================================
📄 ARCHIVO: src\features\pets\domain\repositories\IPetsRepository.ts
================================================

import { CreatePetInput, Pet, PetFilter, UpdatePetInput } from '../entities/Pet';

export interface IPetsRepository {
  // Obtener todas las mascotas disponibles
  getAvailablePets(filter?: PetFilter): Promise<Pet[]>;
  
  // Obtener mascotas de un refugio específico
  getShelterPets(shelterId: string): Promise<Pet[]>;
  
  // Obtener detalle de una mascota
  getPetById(petId: string): Promise<Pet | null>;
  
  // Crear mascota (solo refugios)
  createPet(input: CreatePetInput, shelterId: string): Promise<Pet>;
  
  // Actualizar mascota
  updatePet(petId: string, input: UpdatePetInput): Promise<Pet>;
  
  // Eliminar mascota
  deletePet(petId: string): Promise<void>;
  
  // Buscar mascotas con filtros
  searchPets(filter: PetFilter): Promise<Pet[]>;
  
  // Upload imagen de mascota
  uploadPetImage(petId: string, imageUri: string): Promise<string>;
  
  // Suscribirse a cambios en mascotas disponibles
  subscribeToAvailablePets(onPetsChange: (pets: Pet[]) => void): () => void;
}


================================================
📄 ARCHIVO: src\features\pets\infrastructure\repositories\SupabasePetsRepository.ts
================================================

import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { CreatePetInput, Pet, PetFilter, UpdatePetInput } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

export class SupabasePetsRepository implements IPetsRepository {

  async getAvailablePets(filter?: PetFilter): Promise<Pet[]> {
    let query = supabase
      .from('pets')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (filter) {
      if (filter.species) {
        query = query.eq('species', filter.species);
      }
      if (filter.size) {
        query = query.eq('size', filter.size);
      }
      if (filter.searchText) {
        query = query.ilike('name', `%${filter.searchText}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener mascotas: ${error.message}`);

    return (data || []).map(this.mapPet);
  }

  async getShelterPets(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener mascotas del refugio: ${error.message}`);
    return (data || []).map(this.mapPet);
  }

  async getPetById(petId: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener mascota: ${error.message}`);
    }

    return data ? this.mapPet(data) : null;
  }

  async createPet(input: CreatePetInput, shelterId: string): Promise<Pet> {
    let imageUrl: string | undefined;

    if (input.imageUri) {
      imageUrl = await this.uploadPetImage('', input.imageUri);
    }

    const { data, error } = await supabase
      .from('pets')
      .insert({
        shelter_id: shelterId,
        name: input.name,
        species: input.species,
        breed: input.breed || null,
        age_years: input.ageYears || null,
        age_months: input.ageMonths || null,
        size: input.size,
        weight_kg: input.weightKg || null,
        description: input.description || null,
        temperament: input.temperament || null,
        health_status: input.healthStatus,
        image_url: imageUrl || null,
        available: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear mascota: ${error.message}`);
    return this.mapPet(data);
  }

  async updatePet(petId: string, input: UpdatePetInput): Promise<Pet> {
    let imageUrl: string | undefined;

    if (input.imageUri) {
      imageUrl = await this.uploadPetImage(petId, input.imageUri);
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.breed !== undefined) updateData.breed = input.breed;
    if (input.ageYears !== undefined) updateData.age_years = input.ageYears;
    if (input.ageMonths !== undefined) updateData.age_months = input.ageMonths;
    if (input.size !== undefined) updateData.size = input.size;
    if (input.weightKg !== undefined) updateData.weight_kg = input.weightKg;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.temperament !== undefined) updateData.temperament = input.temperament;
    if (input.healthStatus !== undefined) updateData.health_status = input.healthStatus;
    if (input.available !== undefined) updateData.available = input.available;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;

    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', petId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar mascota: ${error.message}`);
    return this.mapPet(data);
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (error) throw new Error(`Error al eliminar mascota: ${error.message}`);
  }

  async searchPets(filter: PetFilter): Promise<Pet[]> {
    let query = supabase.from('pets').select('*');

    if (filter.species) {
      query = query.eq('species', filter.species);
    }
    if (filter.size) {
      query = query.eq('size', filter.size);
    }
    if (filter.searchText) {
      query = query.ilike('name', `%${filter.searchText}%`);
    }
    if (filter.shelterId) {
      query = query.eq('shelter_id', filter.shelterId);
    } else {
      query = query.eq('available', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`Error en búsqueda: ${error.message}`);

    return (data || []).map(this.mapPet);
  }

  // ✅ CORREGIDO: sin base64-arraybuffer ni ImagePicker.MediaLibrary
  async uploadPetImage(petId: string, imageUri: string): Promise<string> {
    try {
      // Extraemos la extensión para el nombre y el content-type
      const ext = imageUri.split('.').pop() || 'jpg';
      const fileName = `${petId || 'pet'}_${Date.now()}.${ext}`;

      // 1. Leemos el archivo localmente como una cadena de texto Base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64', // <-- Simplemente pon el string en minúsculas
      });

      // 2. Subimos el archivo decodificando el Base64 a un ArrayBuffer
      const { data, error } = await supabase.storage
        .from('pet-images')
        .upload(fileName, decode(base64), {
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          upsert: false,
        });

      if (error) throw new Error(`Error en upload de Supabase: ${error.message}`);

      // 3. Obtenemos la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('pet-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  subscribeToAvailablePets(onPetsChange: (pets: Pet[]) => void): () => void {
    const subscription = supabase
      .channel('public:pets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pets' },
        async () => {
          const pets = await this.getAvailablePets();
          onPetsChange(pets);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  private mapPet(data: any): Pet {
    return {
      id: data.id,
      shelterId: data.shelter_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      ageYears: data.age_years,
      ageMonths: data.age_months,
      size: data.size,
      weightKg: data.weight_kg,
      description: data.description,
      temperament: data.temperament,
      healthStatus: data.health_status,
      imageUrl: data.image_url,
      additionalImages: data.additional_images || [],
      available: data.available,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

================================================
📄 ARCHIVO: src\features\pets\presentation\hooks\usePets.ts
================================================

import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatePetUseCase } from '../../application/use-cases/CreatePetUseCase';
import { DeletePetUseCase } from '../../application/use-cases/DeletePetUseCase';
import { GetAvailablePetsUseCase } from '../../application/use-cases/GetAvailablePetsUseCase';
import { GetPetByIdUseCase } from '../../application/use-cases/GetPetByIdUseCase';
import { GetShelterPetsUseCase } from '../../application/use-cases/GetShelterPetsUseCase';
import { SearchPetsUseCase } from '../../application/use-cases/SearchPetsUseCase';
import { UpdatePetUseCase } from '../../application/use-cases/UpdatePetUseCase';
import { CreatePetInput, Pet, PetFilter, UpdatePetInput } from '../../domain/entities/Pet';
import { SupabasePetsRepository } from '../../infrastructure/repositories/SupabasePetsRepository';

const petsRepo = new SupabasePetsRepository();
const getAvailablePetsUseCase = new GetAvailablePetsUseCase(petsRepo);
const getPetByIdUseCase = new GetPetByIdUseCase(petsRepo);
const getShelterPetsUseCase = new GetShelterPetsUseCase(petsRepo);
const createPetUseCase = new CreatePetUseCase(petsRepo);
const updatePetUseCase = new UpdatePetUseCase(petsRepo);
const deletePetUseCase = new DeletePetUseCase(petsRepo);
const searchPetsUseCase = new SearchPetsUseCase(petsRepo);

export function usePets() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Obtener mascotas disponibles
  const {
    data: availablePets = [],
    isLoading: isLoadingAvailable,
    error: errorAvailable,
  } = useQuery({
    queryKey: ['pets', 'available'],
    queryFn: () => getAvailablePetsUseCase.execute(),
    enabled: !!user,
  });

  // Obtener mascotas del refugio actual (solo si el usuario es refugio)
  const {
    data: shelterPets = [],
    isLoading: isLoadingShelter,
    error: errorShelter,
  } = useQuery({
    queryKey: ['pets', 'shelter', user?.id],
    queryFn: () => getShelterPetsUseCase.execute(user!.id),
    enabled: !!user && user.role === 'shelter',
  });

  // Crear mascota
  const createMutation = useMutation({
    mutationFn: (input: CreatePetInput) => createPetUseCase.execute(input, user!.id),
    onSuccess: (newPet) => {
      queryClient.setQueryData(['pets', 'shelter', user?.id], (old: Pet[] = []) => [newPet, ...old]);
      queryClient.invalidateQueries({ queryKey: ['pets', 'available'] });
    },
  });

  // Actualizar mascota
  const updateMutation = useMutation({
    mutationFn: ({ petId, input }: { petId: string; input: UpdatePetInput }) =>
      updatePetUseCase.execute(petId, input),
    onSuccess: (updatedPet) => {
      queryClient.setQueryData(['pets', 'shelter', user?.id], (old: Pet[] = []) =>
        old.map((p) => (p.id === updatedPet.id ? updatedPet : p))
      );
      queryClient.invalidateQueries({ queryKey: ['pets', 'available'] });
    },
  });

  // Eliminar mascota
  const deleteMutation = useMutation({
    mutationFn: (petId: string) => deletePetUseCase.execute(petId),
    onSuccess: (_, petId) => {
      queryClient.setQueryData(['pets', 'shelter', user?.id], (old: Pet[] = []) =>
        old.filter((p) => p.id !== petId)
      );
      queryClient.invalidateQueries({ queryKey: ['pets', 'available'] });
    },
  });

  // Buscar mascotas
  const searchMutation = useMutation({
    mutationFn: (filter: PetFilter) => searchPetsUseCase.execute(filter),
  });

  return {
    // Mascotas disponibles
    availablePets,
    isLoadingAvailable,
    errorAvailable: errorAvailable?.message ?? null,

    // Mascotas del refugio
    shelterPets,
    isLoadingShelter,
    errorShelter: errorShelter?.message ?? null,

    // Mutaciones
    createPet: createMutation.mutate,
    createPetAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,

    updatePet: updateMutation.mutate,
    updatePetAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error?.message ?? null,

    deletePet: deleteMutation.mutate,
    deletePetAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error?.message ?? null,

    searchPets: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    searchError: searchMutation.error?.message ?? null,
    searchResults: searchMutation.data || [],
  };
}


================================================
📄 ARCHIVO: src\features\shelters\domain\entities\Shelter.ts
================================================

/**
 * CAPA: Domain
 * Entidad Shelter - Representa un refugio de mascotas
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Shelter {
  id: string;
  username: string;
  email: string;
  phone?: string;
  description?: string;
  avatarUrl?: string;
  location?: Location;
}


================================================
📄 ARCHIVO: src\features\shelters\infrastructure\repositories\SupabaseSheltersRepository.ts
================================================

/**
 * CAPA: Infrastructure
 * Repositorio Supabase para operaciones con refugios
 */

import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { Shelter } from '../../domain/entities/Shelter';

export class SupabaseSheltersRepository {
  async getAllShelters(): Promise<Shelter[]> {
    const { data, error } = await supabase
      .from('profiles')
      // ✅ CORRECCIÓN 1: Pedimos 'full_name' en lugar de 'username'
      .select('id, full_name, email, phone, description, avatar_url, location_lat, location_lng, location_address')
      .eq('role', 'shelter')
      // ✅ CORRECCIÓN 2: Ordenamos por 'full_name'
      .order('full_name', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((profile: any) => ({
      id: profile.id,
      // ✅ CORRECCIÓN 3: Mapeamos el 'full_name' de la BD al 'username' que espera tu app
      username: profile.full_name || 'Refugio sin nombre', 
      email: profile.email,
      phone: profile.phone ?? undefined,
      description: profile.description ?? undefined,
      avatarUrl: profile.avatar_url ?? undefined,
      location:
        profile.location_lat && profile.location_lng
          ? {
              latitude: profile.location_lat,
              longitude: profile.location_lng,
              address: profile.location_address ?? undefined,
            }
          : undefined,
    }));
  }
}

================================================
📄 ARCHIVO: src\features\shelters\presentation\hooks\useShelters.ts
================================================

/**
 * CAPA: Presentation
 * Hook custom para gestionar datos de refugios
 * Usa React Query para caching y gestión de estado de servidor
 */

import { useQuery } from '@tanstack/react-query';
import { SupabaseSheltersRepository } from '../../infrastructure/repositories/SupabaseSheltersRepository';

const sheltersRepository = new SupabaseSheltersRepository();

export function useShelters() {
  const {
    data: shelters = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shelters'],
    queryFn: () => sheltersRepository.getAllShelters(),
  });

  const sheltersWithLocation = shelters.filter((shelter) => !!shelter.location);

  return {
    shelters,
    sheltersWithLocation,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}


================================================
📄 ARCHIVO: src\shared\domain\errors\AppError.ts
================================================

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('AUTH_ERROR', message, cause);
  }
}

export class ChatError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('CHAT_ERROR', message, cause);
  }
}

================================================
📄 ARCHIVO: src\shared\infrastructure\supabase\client.ts
================================================

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

================================================
📄 ARCHIVO: tsconfig.json
================================================

{
  "extends": "expo/tsconfig.base",
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "env.d.ts",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "lib": [
      "ESNext"
    ],
    "ignoreDeprecations": "6.0",
    "paths": {
      "@features/*": [
        "src/features/*"
      ],
      "@shared/*": [
        "src/shared/*"
      ]
    }
  }
}


================================================
📄 ARCHIVO: vercel.json
================================================

{
  "buildCommand": "npx expo export -p web",
  "outputDirectory": "dist"
}
