import { Pet, UpdatePetInput } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class UpdatePetUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(petId: string, input: UpdatePetInput): Promise<Pet> {
    if (!petId || petId.trim().length === 0) {
      throw new Error('ID de mascota inválido');
    }
    return this.petsRepo.updatePet(petId, input);
  }
}
