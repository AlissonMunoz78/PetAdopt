export type AdoptionRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AdoptionRequest {
  id: string;
  petId: string;
  adopterId: string;
  shelterId: string;
  status: AdoptionRequestStatus;
  message?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdoptionRequestInput {
  petId: string;
  message?: string;
}

export interface UpdateAdoptionRequestInput {
  status?: AdoptionRequestStatus;
  rejectionReason?: string;
}

// Para combinar con datos de la mascota
export interface AdoptionRequestWithPet extends AdoptionRequest {
  petName: string;
  petImage?: string;
  adopterName: string;
  shelterName: string;
}
