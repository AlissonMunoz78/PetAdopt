import { AdoptionRequest, CreateAdoptionRequestInput, UpdateAdoptionRequestInput } from '../entities/AdoptionRequest';

export interface IAdoptionRequestsRepository {
  // Obtener solicitudes del adoptante
  getAdopterRequests(adopterId: string): Promise<AdoptionRequest[]>;
  
  // Obtener solicitudes recibidas por el refugio
  getShelterRequests(shelterId: string): Promise<AdoptionRequest[]>;
  
  // Obtener solicitudes para una mascota específica
  getPetRequests(petId: string): Promise<AdoptionRequest[]>;
  
  // Obtener detalle de una solicitud
  getRequestById(requestId: string): Promise<AdoptionRequest | null>;
  
  // Crear solicitud de adopción
  createRequest(input: CreateAdoptionRequestInput, adopterId: string, shelterId: string): Promise<AdoptionRequest>;
  
  // Actualizar estado de solicitud
  updateRequest(requestId: string, input: UpdateAdoptionRequestInput): Promise<AdoptionRequest>;
  
  // Cancelar solicitud (solo adoptante)
  cancelRequest(requestId: string): Promise<void>;
  
  // Verificar si hay solicitud existente no resuelta
  hasExistingRequest(petId: string, adopterId: string): Promise<boolean>;
  
  // Suscribirse a cambios en solicitudes del refugio
  subscribeToShelterRequests(shelterId: string, onRequestsChange: (requests: AdoptionRequest[]) => void): () => void;
}
