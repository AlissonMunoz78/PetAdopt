import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatePetUseCase } from '../../application/use-cases/CreatePetUseCase';
import { DeletePetUseCase } from '../../application/use-cases/DeletePetUseCase';
import { GetAvailablePetsUseCase } from '../../application/use-cases/GetAvailablePetsUseCase';
import { GetPetByIdUseCase } from '../../application/use-cases/GetPetByIdUseCase';
import { GetShelterPetsUseCase } from '../../application/use-cases/GetShelterPetsUseCase';
import { SearchPetsUseCase } from '../../application/use-cases/SearchPetsUseCase';
import { UpdatePetUseCase } from '../../application/use-cases/UpdatePetUseCase';
import { CreatePetInput, Pet, PetFilter, UpdatePetInput } from '../../domain/entities/Pet';
import { SupabasePetsRepository } from '../../infrastructure/repositories/SupabasePetsRepository';

const petsRepo = new SupabasePetsRepository();
const getAvailablePetsUseCase = new GetAvailablePetsUseCase(petsRepo);
const getPetByIdUseCase = new GetPetByIdUseCase(petsRepo);
const getShelterPetsUseCase = new GetShelterPetsUseCase(petsRepo);
const createPetUseCase = new CreatePetUseCase(petsRepo);
const updatePetUseCase = new UpdatePetUseCase(petsRepo);
const deletePetUseCase = new DeletePetUseCase(petsRepo);
const searchPetsUseCase = new SearchPetsUseCase(petsRepo);

export function usePets() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Obtener mascotas disponibles
  const {
    data: availablePets = [],
    isLoading: isLoadingAvailable,
    error: errorAvailable,
  } = useQuery({
    queryKey: ['pets', 'available'],
    queryFn: () => getAvailablePetsUseCase.execute(),
    enabled: !!user,
  });

  // Obtener mascotas del refugio actual (solo si el usuario es refugio)
  const {
    data: shelterPets = [],
    isLoading: isLoadingShelter,
    error: errorShelter,
  } = useQuery({
    queryKey: ['pets', 'shelter', user?.id],
    queryFn: () => getShelterPetsUseCase.execute(user!.id),
    enabled: !!user && user.role === 'shelter',
  });

  // Crear mascota
  const createMutation = useMutation({
    mutationFn: (input: CreatePetInput) => createPetUseCase.execute(input, user!.id),
    onSuccess: (newPet) => {
      queryClient.setQueryData(['pets', 'shelter', user?.id], (old: Pet[] = []) => [newPet, ...old]);
      queryClient.invalidateQueries({ queryKey: ['pets', 'available'] });
    },
  });

  // Actualizar mascota
  const updateMutation = useMutation({
    mutationFn: ({ petId, input }: { petId: string; input: UpdatePetInput }) =>
      updatePetUseCase.execute(petId, input),
    onSuccess: (updatedPet) => {
      queryClient.setQueryData(['pets', 'shelter', user?.id], (old: Pet[] = []) =>
        old.map((p) => (p.id === updatedPet.id ? updatedPet : p))
      );
      queryClient.invalidateQueries({ queryKey: ['pets', 'available'] });
    },
  });

  // Eliminar mascota
  const deleteMutation = useMutation({
    mutationFn: (petId: string) => deletePetUseCase.execute(petId),
    onSuccess: (_, petId) => {
      queryClient.setQueryData(['pets', 'shelter', user?.id], (old: Pet[] = []) =>
        old.filter((p) => p.id !== petId)
      );
      queryClient.invalidateQueries({ queryKey: ['pets', 'available'] });
    },
  });

  // Buscar mascotas
  const searchMutation = useMutation({
    mutationFn: (filter: PetFilter) => searchPetsUseCase.execute(filter),
  });

  return {
    // Mascotas disponibles
    availablePets,
    isLoadingAvailable,
    errorAvailable: errorAvailable?.message ?? null,

    // Mascotas del refugio
    shelterPets,
    isLoadingShelter,
    errorShelter: errorShelter?.message ?? null,

    // Mutaciones
    createPet: createMutation.mutate,
    createPetAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,

    updatePet: updateMutation.mutate,
    updatePetAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error?.message ?? null,

    deletePet: deleteMutation.mutate,
    deletePetAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error?.message ?? null,

    searchPets: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    searchError: searchMutation.error?.message ?? null,
    searchResults: searchMutation.data || [],
  };
}
