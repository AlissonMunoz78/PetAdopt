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