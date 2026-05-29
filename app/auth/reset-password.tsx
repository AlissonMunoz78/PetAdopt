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
