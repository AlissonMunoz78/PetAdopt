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
