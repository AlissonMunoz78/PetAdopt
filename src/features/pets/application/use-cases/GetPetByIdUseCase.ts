import { Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class GetPetByIdUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(petId: string): Promise<Pet | null> {
    if (!petId || petId.trim().length === 0) {
      throw new Error('ID de mascota inválido');
    }
    return this.petsRepo.getPetById(petId);
  }
}
