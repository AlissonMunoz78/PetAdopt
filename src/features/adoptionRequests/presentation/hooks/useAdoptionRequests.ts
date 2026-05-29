import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CancelAdoptionRequestUseCase } from '../../application/use-cases/CancelAdoptionRequestUseCase';
import { CreateAdoptionRequestUseCase } from '../../application/use-cases/CreateAdoptionRequestUseCase';
import { GetAdopterRequestsUseCase } from '../../application/use-cases/GetAdopterRequestsUseCase';
import { GetShelterRequestsUseCase } from '../../application/use-cases/GetShelterRequestsUseCase';
import { UpdateAdoptionRequestUseCase } from '../../application/use-cases/UpdateAdoptionRequestUseCase';
import { AdoptionRequest, CreateAdoptionRequestInput, UpdateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { SupabaseAdoptionRequestsRepository } from '../../infrastructure/repositories/SupabaseAdoptionRequestsRepository';

const requestsRepo = new SupabaseAdoptionRequestsRepository();
const createRequestUseCase = new CreateAdoptionRequestUseCase(requestsRepo);
const getAdopterRequestsUseCase = new GetAdopterRequestsUseCase(requestsRepo);
const getShelterRequestsUseCase = new GetShelterRequestsUseCase(requestsRepo);
const updateRequestUseCase = new UpdateAdoptionRequestUseCase(requestsRepo);
const cancelRequestUseCase = new CancelAdoptionRequestUseCase(requestsRepo);

export function useAdoptionRequests() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Obtener solicitudes del adoptante
  const {
    data: adopterRequests = [],
    isLoading: isLoadingAdopterRequests,
    error: errorAdopterRequests,
  } = useQuery({
    queryKey: ['adoption_requests', 'adopter', user?.id],
    queryFn: () => getAdopterRequestsUseCase.execute(user!.id),
    enabled: !!user && user.role === 'adopter',
  });

  // Obtener solicitudes recibidas por el refugio
  const {
    data: shelterRequests = [],
    isLoading: isLoadingShelterRequests,
    error: errorShelterRequests,
  } = useQuery({
    queryKey: ['adoption_requests', 'shelter', user?.id],
    queryFn: () => getShelterRequestsUseCase.execute(user!.id),
    enabled: !!user && user.role === 'shelter',
  });

  // Crear solicitud de adopción
  const createMutation = useMutation({
    mutationFn: async (input: CreateAdoptionRequestInput & { shelterId: string }) => {
      const { shelterId, petId, message } = input;
      return createRequestUseCase.execute({ petId, message }, user!.id, shelterId);
    },
    onSuccess: (newRequest) => {
      queryClient.setQueryData(['adoption_requests', 'adopter', user?.id], (old: AdoptionRequest[] = []) => [
        newRequest,
        ...old,
      ]);
    },
  });

  // Actualizar solicitud (aprobar/rechazar)
  const updateMutation = useMutation({
    mutationFn: ({ requestId, input }: { requestId: string; input: UpdateAdoptionRequestInput }) =>
      updateRequestUseCase.execute(requestId, input),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(['adoption_requests', 'shelter', user?.id], (old: AdoptionRequest[] = []) =>
        old.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
      );
      queryClient.invalidateQueries({ queryKey: ['adoption_requests', 'adopter'] });
    },
  });

  // Cancelar solicitud
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelRequestUseCase.execute(requestId),
    onSuccess: (_, requestId) => {
      queryClient.setQueryData(['adoption_requests', 'adopter', user?.id], (old: AdoptionRequest[] = []) =>
        old.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' as const } : r))
      );
    },
  });

  return {
    // Solicitudes del adoptante
    adopterRequests,
    isLoadingAdopterRequests,
    errorAdopterRequests: errorAdopterRequests?.message ?? null,

    // Solicitudes del refugio
    shelterRequests,
    isLoadingShelterRequests,
    errorShelterRequests: errorShelterRequests?.message ?? null,

    // Mutaciones
    createRequest: createMutation.mutate,
    createRequestAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,

    updateRequest: updateMutation.mutate,
    updateRequestAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error?.message ?? null,

    cancelRequest: cancelMutation.mutate,
    cancelRequestAsync: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error?.message ?? null,
  };
}
