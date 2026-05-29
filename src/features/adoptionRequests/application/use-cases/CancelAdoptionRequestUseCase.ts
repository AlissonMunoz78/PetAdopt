import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class CancelAdoptionRequestUseCase {
  constructor(private readonly requestsRepo: IAdoptionRequestsRepository) {}

  async execute(requestId: string): Promise<void> {
    if (!requestId) {
      throw new Error('ID de solicitud inválido');
    }
    return this.requestsRepo.cancelRequest(requestId);
  }
}
