import { supabase } from "@shared/infrastructure/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { LoginWithGoogleUseCase } from "../../application/use-cases/LoginWithGoogleUseCase";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { UpdateLocationUseCase } from "../../application/use-cases/UpdateLocationUseCase";
import { UserLocation } from "../../domain/entities/User";
import { SupabaseAuthRepository } from "../../infrastructure/repositories/SupabaseAuthRepository";
import { useAuthStore } from "../store/authStore";
import { buildAuthCallbackUrl } from "../utils/authRedirect";

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepo);
const updateLocationUseCase = new UpdateLocationUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/(app)");
    },
  });

  const loginGoogleMutation = useMutation({
    mutationFn: () => loginWithGoogleUseCase.execute(),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      username,
      role,
    }: {
      email: string;
      password: string;
      username: string;
      role: "shelter" | "adopter";
    }) => {
      const redirectTo = buildAuthCallbackUrl("confirmation", "/login");
      return registerUseCase.execute(
        email,
        password,
        username,
        role,
        redirectTo,
      );
    },
    onSuccess: async (u) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(u);
        router.replace("/(app)");
        return;
      }

      router.replace("/auth/confirm-account?next=/login");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => {
      const redirectTo = buildAuthCallbackUrl("recovery", "/login");
      return resetPasswordUseCase.execute(email, redirectTo);
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: (location: UserLocation) =>
      updateLocationUseCase.execute(user!.id, location),
    onSuccess: (_, location) => {
      if (user) setUser({ ...user, location });
    },
  });

  const logout = async () => {
    try {
      await authRepo.logout();
    } finally {
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  return {
    user,
    login: loginMutation.mutate,
    loginWithGoogle: loginGoogleMutation.mutate,
    register: registerMutation.mutate,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateLocation: updateLocationMutation.mutate,
    logout,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      loginGoogleMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingLocation: updateLocationMutation.isPending,
    error:
      loginMutation.error?.message ??
      registerMutation.error?.message ??
      loginGoogleMutation.error?.message ??
      null,
  };
}
