import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { CreatePetInput, Pet, PetFilter, UpdatePetInput } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

export class SupabasePetsRepository implements IPetsRepository {

  async getAvailablePets(filter?: PetFilter): Promise<Pet[]> {
    let query = supabase
      .from('pets')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (filter) {
      if (filter.species) {
        query = query.eq('species', filter.species);
      }
      if (filter.size) {
        query = query.eq('size', filter.size);
      }
      if (filter.searchText) {
        query = query.ilike('name', `%${filter.searchText}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener mascotas: ${error.message}`);

    return (data || []).map(this.mapPet);
  }

  async getShelterPets(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener mascotas del refugio: ${error.message}`);
    return (data || []).map(this.mapPet);
  }

  async getPetById(petId: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener mascota: ${error.message}`);
    }

    return data ? this.mapPet(data) : null;
  }

  async createPet(input: CreatePetInput, shelterId: string): Promise<Pet> {
    let imageUrl: string | undefined;

    if (input.imageUri) {
      imageUrl = await this.uploadPetImage('', input.imageUri);
    }

    const { data, error } = await supabase
      .from('pets')
      .insert({
        shelter_id: shelterId,
        name: input.name,
        species: input.species,
        breed: input.breed || null,
        age_years: input.ageYears || null,
        age_months: input.ageMonths || null,
        size: input.size,
        weight_kg: input.weightKg || null,
        description: input.description || null,
        temperament: input.temperament || null,
        health_status: input.healthStatus,
        image_url: imageUrl || null,
        available: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear mascota: ${error.message}`);
    return this.mapPet(data);
  }

  async updatePet(petId: string, input: UpdatePetInput): Promise<Pet> {
    let imageUrl: string | undefined;

    if (input.imageUri) {
      imageUrl = await this.uploadPetImage(petId, input.imageUri);
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.breed !== undefined) updateData.breed = input.breed;
    if (input.ageYears !== undefined) updateData.age_years = input.ageYears;
    if (input.ageMonths !== undefined) updateData.age_months = input.ageMonths;
    if (input.size !== undefined) updateData.size = input.size;
    if (input.weightKg !== undefined) updateData.weight_kg = input.weightKg;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.temperament !== undefined) updateData.temperament = input.temperament;
    if (input.healthStatus !== undefined) updateData.health_status = input.healthStatus;
    if (input.available !== undefined) updateData.available = input.available;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;

    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', petId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar mascota: ${error.message}`);
    return this.mapPet(data);
  }

  async deletePet(petId: string): Promise<void> {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (error) throw new Error(`Error al eliminar mascota: ${error.message}`);
  }

  async searchPets(filter: PetFilter): Promise<Pet[]> {
    let query = supabase.from('pets').select('*');

    if (filter.species) {
      query = query.eq('species', filter.species);
    }
    if (filter.size) {
      query = query.eq('size', filter.size);
    }
    if (filter.searchText) {
      query = query.ilike('name', `%${filter.searchText}%`);
    }
    if (filter.shelterId) {
      query = query.eq('shelter_id', filter.shelterId);
    } else {
      query = query.eq('available', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(`Error en búsqueda: ${error.message}`);

    return (data || []).map(this.mapPet);
  }

  // ✅ CORREGIDO: sin base64-arraybuffer ni ImagePicker.MediaLibrary
  async uploadPetImage(petId: string, imageUri: string): Promise<string> {
    try {
      // Extraemos la extensión para el nombre y el content-type
      const ext = imageUri.split('.').pop() || 'jpg';
      const fileName = `${petId || 'pet'}_${Date.now()}.${ext}`;

      // 1. Leemos el archivo localmente como una cadena de texto Base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64', // <-- Simplemente pon el string en minúsculas
      });

      // 2. Subimos el archivo decodificando el Base64 a un ArrayBuffer
      const { data, error } = await supabase.storage
        .from('pet-images')
        .upload(fileName, decode(base64), {
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          upsert: false,
        });

      if (error) throw new Error(`Error en upload de Supabase: ${error.message}`);

      // 3. Obtenemos la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('pet-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  subscribeToAvailablePets(onPetsChange: (pets: Pet[]) => void): () => void {
    const subscription = supabase
      .channel('public:pets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pets' },
        async () => {
          const pets = await this.getAvailablePets();
          onPetsChange(pets);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  private mapPet(data: any): Pet {
    return {
      id: data.id,
      shelterId: data.shelter_id,
      name: data.name,
      species: data.species,
      breed: data.breed,
      ageYears: data.age_years,
      ageMonths: data.age_months,
      size: data.size,
      weightKg: data.weight_kg,
      description: data.description,
      temperament: data.temperament,
      healthStatus: data.health_status,
      imageUrl: data.image_url,
      additionalImages: data.additional_images || [],
      available: data.available,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}