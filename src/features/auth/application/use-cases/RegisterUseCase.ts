import { AuthError } from '../../../../shared/domain/errors/AppError';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string, username: string, role: 'adopter' | 'shelter'): Promise<User> {
    if (!email || !password || !username)
      throw new AuthError('Todos los campos son requeridos');
    if (password.length < 6)
      throw new AuthError('La contraseña debe tener al menos 6 caracteres');
    if (username.includes(' '))
      throw new AuthError('El username no puede contener espacios');
    if (!['adopter', 'shelter'].includes(role))
      throw new AuthError('El rol debe ser adopter o shelter');
    try {
      return await this.authRepo.register(email, password, username, role);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar usuario';
      throw new AuthError(message, error);
    }
  }
}