import { User, UserLocation } from "../entities/User";

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  register(
    email: string,
    password: string,
    username: string,
    role: "adopter" | "shelter",
    redirectTo?: string,
  ): Promise<User>;
  resetPassword(email: string, redirectTo: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateLocation(userId: string, location: UserLocation): Promise<void>;
}
