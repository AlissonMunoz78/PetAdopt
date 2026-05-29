/**
 * CAPA: Domain
 * Entidad Shelter - Representa un refugio de mascotas
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Shelter {
  id: string;
  username: string;
  email: string;
  phone?: string;
  description?: string;
  avatarUrl?: string;
  location?: Location;
}
