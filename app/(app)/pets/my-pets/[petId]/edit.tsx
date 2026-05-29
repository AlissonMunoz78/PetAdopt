import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function EditPetScreen() {
  const { petId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Simplemente redirigir a la pantalla create con el petId como parámetro
    // La pantalla create maneja tanto creación como edición
    if (petId) {
      router.replace(`/pets/my-pets/create?petId=${petId}`);
    }
  }, [petId]);

  return null;
}
