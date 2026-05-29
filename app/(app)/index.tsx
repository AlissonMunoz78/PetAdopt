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