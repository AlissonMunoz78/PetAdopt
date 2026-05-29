import { CreatePetInput, Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class CreatePetUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(input: CreatePetInput, shelterId: string): Promise<Pet> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('El nombre de la mascota es requerido');
    }
    if (!input.species) {
      throw new Error('La especie de la mascota es requerida');
    }
    if (!input.size) {
      throw new Error('El tamaño de la mascota es requerido');
    }
    if (!input.healthStatus) {
      throw new Error('El estado de salud es requerido');
    }

    return this.petsRepo.createPet(input, shelterId);
  }
}
