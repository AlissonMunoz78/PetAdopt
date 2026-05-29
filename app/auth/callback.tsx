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
