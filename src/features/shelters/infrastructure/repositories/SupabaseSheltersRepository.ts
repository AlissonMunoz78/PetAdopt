/**
 * CAPA: Infrastructure
 * Repositorio Supabase para operaciones con refugios
 */

import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { Shelter } from '../../domain/entities/Shelter';

export class SupabaseSheltersRepository {
  async getAllShelters(): Promise<Shelter[]> {
    const { data, error } = await supabase
      .from('profiles')
      // ✅ CORRECCIÓN 1: Pedimos 'full_name' en lugar de 'username'
      .select('id, full_name, email, phone, description, avatar_url, location_lat, location_lng, location_address')
      .eq('role', 'shelter')
      // ✅ CORRECCIÓN 2: Ordenamos por 'full_name'
      .order('full_name', { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((profile: any) => ({
      id: profile.id,
      // ✅ CORRECCIÓN 3: Mapeamos el 'full_name' de la BD al 'username' que espera tu app
      username: profile.full_name || 'Refugio sin nombre', 
      email: profile.email,
      phone: profile.phone ?? undefined,
      description: profile.description ?? undefined,
      avatarUrl: profile.avatar_url ?? undefined,
      location:
        profile.location_lat && profile.location_lng
          ? {
              latitude: profile.location_lat,
              longitude: profile.location_lng,
              address: profile.location_address ?? undefined,
            }
          : undefined,
    }));
  }
}