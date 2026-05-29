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