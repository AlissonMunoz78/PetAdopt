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
