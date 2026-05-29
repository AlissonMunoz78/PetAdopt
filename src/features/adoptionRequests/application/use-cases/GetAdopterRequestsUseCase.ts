import { AdoptionRequest } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class GetAdopterRequestsUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(adopterId: string): Promise<AdoptionRequest[]> {
    if (!adopterId) {
      throw new Error('ID de adoptante inválido');
    }
    return this.requestsRepo.getAdopterRequests(adopterId);
  }
}
