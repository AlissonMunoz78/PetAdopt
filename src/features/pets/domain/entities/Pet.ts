export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
export type PetSize = 'small' | 'medium' | 'large' | 'xlarge';
export type HealthStatus = 'healthy' | 'medical_attention' | 'vaccinated';

export interface Pet {
  id: string;
  shelterId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  ageYears?: number;
  ageMonths?: number;
  size: PetSize;
  weightKg?: number;
  description?: string;
  temperament?: string;
  healthStatus: HealthStatus;
  imageUrl?: string;
  additionalImages?: string[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetInput {
  name: string;
  species: PetSpecies;
  breed?: string;
  ageYears?: number;
  ageMonths?: number;
  size: PetSize;
  weightKg?: number;
  description?: string;
  temperament?: string;
  healthStatus: HealthStatus;
  imageUri?: string;
}

export interface UpdatePetInput {
  name?: string;
  breed?: string;
  ageYears?: number;
  ageMonths?: number;
  size?: PetSize;
  weightKg?: number;
  description?: string;
  temperament?: string;
  healthStatus?: HealthStatus;
  available?: boolean;
  imageUri?: string;
}

export interface PetFilter {
  species?: PetSpecies;
  size?: PetSize;
  minAge?: number;
  maxAge?: number;
  searchText?: string;
  shelterId?: string;
}
