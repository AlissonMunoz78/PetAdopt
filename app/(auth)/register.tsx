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