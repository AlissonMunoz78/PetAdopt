import { AdoptionRequest, UpdateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class UpdateAdoptionRequestUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(requestId: string, input: UpdateAdoptionRequestInput): Promise<AdoptionRequest> {
    if (!requestId) {
      throw new Error('ID de solicitud inválido');
    }
    return this.requestsRepo.updateRequest(requestId, input);
  }
}
