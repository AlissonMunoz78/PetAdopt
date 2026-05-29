import { CreatePetInput, Pet, PetFilter, UpdatePetInput } from '../entities/Pet';

export interface IPetsRepository {
  // Obtener todas las mascotas disponibles
  getAvailablePets(filter?: PetFilter): Promise<Pet[]>;
  
  // Obtener mascotas de un refugio específico
  getShelterPets(shelterId: string): Promise<Pet[]>;
  
  // Obtener detalle de una mascota
  getPetById(petId: string): Promise<Pet | null>;
  
  // Crear mascota (solo refugios)
  createPet(input: CreatePetInput, shelterId: string): Promise<Pet>;
  
  // Actualizar mascota
  updatePet(petId: string, input: UpdatePetInput): Promise<Pet>;
  
  // Eliminar mascota
  deletePet(petId: string): Promise<void>;
  
  // Buscar mascotas con filtros
  searchPets(filter: PetFilter): Promise<Pet[]>;
  
  // Upload imagen de mascota
  uploadPetImage(petId: string, imageUri: string): Promise<string>;
  
  // Suscribirse a cambios en mascotas disponibles
  subscribeToAvailablePets(onPetsChange: (pets: Pet[]) => void): () => void;
}
