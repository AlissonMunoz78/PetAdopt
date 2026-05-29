import { Pet, PetFilter } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class SearchPetsUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(filter: PetFilter): Promise<Pet[]> {
    return this.petsRepo.searchPets(filter);
  }
}
