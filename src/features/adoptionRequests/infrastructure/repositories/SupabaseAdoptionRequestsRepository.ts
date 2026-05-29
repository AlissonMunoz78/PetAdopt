import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { AdoptionRequest, CreateAdoptionRequestInput, UpdateAdoptionRequestInput } from '../../domain/entities/AdoptionRequest';
import { IAdoptionRequestsRepository } from '../../domain/repositories/IAdoptionRequestsRepository';

export class SupabaseAdoptionRequestsRepository implements IAdoptionRequestsRepository {
  
  async getAdopterRequests(adopterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('adopter_id', adopterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener solicitudes: ${error.message}`);
    return (data || []).map(this.mapRequest);
  }

  async getShelterRequests(shelterId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('shelter_id', shelterId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener solicitudes del refugio: ${error.message}`);
    return (data || []).map(this.mapRequest);
  }

  async getPetRequests(petId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener solicitudes de mascota: ${error.message}`);
    return (data || []).map(this.mapRequest);
  }

  async getRequestById(requestId: string): Promise<AdoptionRequest | null> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener solicitud: ${error.message}`);
    }

    return data ? this.mapRequest(data) : null;
  }

  async createRequest(
    input: CreateAdoptionRequestInput,
    adopterId: string,
    shelterId: string
  ): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .insert({
        pet_id: input.petId,
        adopter_id: adopterId,
        shelter_id: shelterId,
        message: input.message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear solicitud: ${error.message}`);
    return this.mapRequest(data);
  }

  async updateRequest(requestId: string, input: UpdateAdoptionRequestInput): Promise<AdoptionRequest> {
    const updateData: any = {};
    
    if (input.status !== undefined) updateData.status = input.status;
    if (input.rejectionReason !== undefined) updateData.rejection_reason = input.rejectionReason;

    const { data, error } = await supabase
      .from('adoption_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar solicitud: ${error.message}`);
    return this.mapRequest(data);
  }

  async cancelRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('adoption_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    if (error) throw new Error(`Error al cancelar solicitud: ${error.message}`);
  }

  async hasExistingRequest(petId: string, adopterId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .select('id', { count: 'exact', head: true })
      .eq('pet_id', petId)
      .eq('adopter_id', adopterId)
      .neq('status', 'rejected')
      .neq('status', 'cancelled');

    if (error) throw new Error(`Error al verificar solicitud: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  subscribeToShelterRequests(
    shelterId: string,
    onRequestsChange: (requests: AdoptionRequest[]) => void
  ): () => void {
    const subscription = supabase
      .channel(`shelter:${shelterId}:requests`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'adoption_requests',
          filter: `shelter_id=eq.${shelterId}`,
        },
        async () => {
          const requests = await this.getShelterRequests(shelterId);
          onRequestsChange(requests);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  private mapRequest(data: any): AdoptionRequest {
    return {
      id: data.id,
      petId: data.pet_id,
      adopterId: data.adopter_id,
      shelterId: data.shelter_id,
      status: data.status,
      message: data.message,
      rejectionReason: data.rejection_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
