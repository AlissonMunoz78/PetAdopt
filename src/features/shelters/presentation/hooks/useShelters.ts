/**
 * CAPA: Presentation
 * Hook custom para gestionar datos de refugios
 * Usa React Query para caching y gestión de estado de servidor
 */

import { useQuery } from '@tanstack/react-query';
import { SupabaseSheltersRepository } from '../../infrastructure/repositories/SupabaseSheltersRepository';

const sheltersRepository = new SupabaseSheltersRepository();

export function useShelters() {
  const {
    data: shelters = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shelters'],
    queryFn: () => sheltersRepository.getAllShelters(),
  });

  const sheltersWithLocation = shelters.filter((shelter) => !!shelter.location);

  return {
    shelters,
    sheltersWithLocation,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
