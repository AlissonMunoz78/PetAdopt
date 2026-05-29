import { IPetsRepository } from '../../domain/repositories/IPetsRepository';

export class DeletePetUseCase {
  constructor(private readonly petsRepo: IPetsRepository) {}

  async execute(petId: string): Promise<void> {
    if (!petId || petId.trim().length === 0) {
      throw new Error('ID de mascota inválido');
    }
    return this.petsRepo.deletePet(petId);
  }
}
