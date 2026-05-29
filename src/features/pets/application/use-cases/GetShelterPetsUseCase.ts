import { Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class GetShelterPetsUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(shelterId: string): Promise<Pet[]> {
    if (!shelterId || shelterId.trim().length === 0) {
      throw new Error('ID de refugio inválido');
    }
    return this.petsRepo.getShelterPets(shelterId);
  }
}
