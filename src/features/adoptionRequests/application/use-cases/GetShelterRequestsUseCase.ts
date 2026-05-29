import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class GetShelterRequestsUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(shelterId: string): Promise<AdoptionRequest[]> {
    if (!shelterId) {
      throw new Error('ID de refugio inválido');
    }
    return this.requestsRepo.getShelterRequests(shelterId);
  }
}
