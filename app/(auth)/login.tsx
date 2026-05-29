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