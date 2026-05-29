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