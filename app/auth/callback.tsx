import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { supabase } from '../../src/shared/infrastructure/supabase/client';
import { useAuthStore } from '../../src/features/auth/presentation/store/authStore';
import LottieError from '../../assets/animations/e598df70-1153-11ee-99a5-af0fb90d62d0.json'; // O la ruta que corresponda
import LottieDog from '../../assets/animations/tu-perrito.json';



const CORAL = '#A86A5A';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user); // Escuchamos el estado global

  // 1. Redirigir SOLO cuando el guardia haya cargado completamente el perfil
  useEffect(() => {
    if (user) {
      router.replace('/(app)');
    }
  }, [user]);

  // AuthCallback.tsx - Limpia la lógica
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Cuando el link es válido, Supabase nos loguea automáticamente
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        // Verificamos si realmente hay una sesión activa
        if (session) {
          router.replace('/auth/reset-password');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        {/* Lottie para estado de error / enlace expirado */}
        <LottieView
          autoPlay
          loop
          source={LottieError}
          style={styles.lottieError}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Lottie del perrito para estado de carga */}
      <LottieView
        autoPlay
        loop
        source={LottieDog}
        style={styles.lottieLoading}
      />
      <Text style={styles.loadingText}>Verificando enlace...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCFAF8',
    padding: 24
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#717171'
  },
  errorText: {
    fontSize: 15,
    color: CORAL,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
    fontWeight: '500'
  },
  link: {
    fontSize: 14,
    color: '#7D9BAB',
    textDecorationLine: 'underline',
    fontWeight: '600'
  },
  lottieLoading: {
    width: 150,
    height: 150,
  },
  lottieError: {
    width: 120,
    height: 120,
    marginBottom: 10,
  }
});