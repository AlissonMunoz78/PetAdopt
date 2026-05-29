import { AuthError } from '../../../../shared/domain/errors/AppError';
import { UserLocation } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class UpdateLocationUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(userId: string, location: UserLocation): Promise<void> {
    if (!userId) throw new AuthError('Usuario no autenticado');
    if (!location.latitude || !location.longitude)
      throw new AuthError('Coordenadas inválidas');
    return this.authRepo.updateLocation(userId, location);
  }
}
