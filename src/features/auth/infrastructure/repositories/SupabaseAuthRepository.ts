import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserLocation } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

WebBrowser.maybeCompleteAuthSession();

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error ?? new Error("Error al iniciar sesión");
    return this._fetchProfile(data.user.id, data.user.email!);
  }

  async loginWithGoogle(): Promise<User> {
    // ✅ CORRECCIÓN 1: Usamos makeRedirectUri para que Expo sepa cómo volver a la app
    const redirectTo = makeRedirectUri({ scheme: 'examenapp', path: 'auth/callback' }); 
    console.log("👉 NUEVA URL PARA SUPABASE:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) throw error;

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const { params, errorCode } = QueryParams.getQueryParams(result.url);

        if (errorCode) throw new Error(errorCode);

        if (params.access_token && params.refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });

          if (sessionError) throw sessionError;
        }
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No se pudo obtener el usuario de Google');

    // ✅ CORRECCIÓN 2: Eliminamos la lógica duplicada que sobreescribía el rol a 'adopter'.
    // Ahora simplemente pedimos que busque el perfil correcto.
    return this._fetchProfile(user.id, user.email!);
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: "adopter" | "shelter",
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: username,
          role: role
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("No se pudo crear el usuario");

    return { id: data.user.id, email: data.user.email!, username, role };
  }

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return this._fetchProfile(user.id, user.email!);
  }

  async updateLocation(userId: string, location: UserLocation): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        location_lat: location.latitude,
        location_lng: location.longitude,
        location_address: location.address ?? null,
      })
      .eq('id', userId);
    if (error) throw new Error(error.message);
  }

  private async _fetchProfile(userId: string, email: string): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role, location_lat, location_lng, location_address')
      .eq('id', userId)
      .maybeSingle(); 

    if (error) {
      console.error("Error al consultar perfil:", error);
      throw new Error(`Error de BD al obtener perfil: ${error.message}`);
    }

    if (!profile) {
      console.log("Perfil no encontrado. Creando uno nuevo automáticamente...");
      const { data: { user } } = await supabase.auth.getUser();
      const username = user?.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase() 
                        ?? email.split('@')[0];

      // ✅ CORRECCIÓN 3: Omitimos la propiedad "role" en este upsert. 
      // Si la BD ya tenía el rol guardado como 'shelter' por el trigger, no lo sobreescribimos.
      // Si el usuario es nuevo, la BD automáticamente le pondrá 'adopter' por defecto.
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: username,
        avatar_url: user?.user_metadata?.avatar_url ?? null,
      });

      if (upsertError) {
        console.error("🔥 Error crítico al guardar el perfil:", upsertError);
        throw new Error(`Error de BD: ${upsertError.message}`);
      }

      return {
        id: userId,
        email,
        username,
        role: 'adopter', // Devolvemos adoptante solo como lectura rápida para esta sesión inicial
        avatarUrl: user?.user_metadata?.avatar_url ?? undefined,
      };
    }

    return {
      id: userId,
      email,
      username:  profile.full_name, // Mapeamos al frontend
      role:      profile.role as 'adopter' | 'shelter',
      avatarUrl: profile.avatar_url ?? undefined,
      location: profile.location_lat ? {
        latitude: profile.location_lat,
        longitude: profile.location_lng,
        address: profile.location_address ?? undefined,
      } : undefined,
    };
  }
}