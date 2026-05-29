import { Pet } from '../../domain/entities/Pet';
import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class GetAvailablePetsUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(): Promise<Pet[]> {
    return this.petsRepo.getAvailablePets();
  }
}
