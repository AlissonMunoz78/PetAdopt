import { AdoptionRequest, CreateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class CreateAdoptionRequestUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(input: CreateAdoptionRequestInput, adopterId: string, shelterId: string): Promise<AdoptionRequest> {
    if (!input.petId) {
      throw new Error('ID de mascota requerido');
    }

    // Verificar si ya existe una solicitud no resuelta
    const hasExisting = await this.requestsRepo.hasExistingRequest(input.petId, adopterId);
    if (hasExisting) {
      throw new Error('Ya tienes una solicitud pendiente para esta mascota');
    }

    return this.requestsRepo.createRequest(input, adopterId, shelterId);
  }
}
