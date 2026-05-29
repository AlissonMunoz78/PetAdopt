import { useAdoptionRequests } from '@features/adoptionRequests/presentation/hooks/useAdoptionRequests';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { useState } from 'react';
import { usePets } from '@features/pets/presentation/hooks/usePets';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '../../../../components/ui/icon-symbol';

// 🎨 Paleta extraída directamente de tu imagen de referencia
const PALETTE = {
  primaryDark: "#006B54",   // Verde oscuro sólido (Botón Aceptar)
  primaryLight: "#D9EBE6",  // Verde pastel (Píldoras/Tags)
  primaryText: "#185045",   // Verde texto oscuro (Texto en píldoras)
  dangerOutline: "#8D273A", // Rojo oscuro (Borde y texto Rechazar)
  white: "#FFFFFF",
  bgLight: "#FAFAFC",       // Fondo general sutil
  textDark: "#1A1A1A",      // Texto principal
  textGray: "#6B7280",      // Texto secundario
  border: "#E5E7EB",
  avatarBg: "#E0F2FE",      // Fondo celestito del avatar
  avatarIcon: "#0369A1",    // Icono azul oscuro del avatar
};

export default function AdoptionRequestsScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    adopterRequests,
    shelterRequests,
    isLoadingAdopterRequests,
    isLoadingShelterRequests,
    updateRequest,
    updateError,
    isUpdating,
    cancelRequest,
    isCancelling,
  } = useAdoptionRequests();

  const { shelterPets, availablePets } = usePets();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const isShelter = user?.role === 'shelter';
  const requests = isShelter ? shelterRequests : adopterRequests;
  const isLoading = isShelter ? isLoadingShelterRequests : isLoadingAdopterRequests;

  const handleApprove = (requestId: string) => {
    Alert.alert('Aprobar solicitud', '¿Confirmas que deseas aceptar a este adoptante?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        style: 'default',
        onPress: () => {
          updateRequest({
            requestId,
            input: { status: 'approved' },
          });
        },
      },
    ]);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (selectedRequest) {
      updateRequest({
        requestId: selectedRequest.id,
        input: { status: 'rejected', rejectionReason: rejectionReason || undefined },
      });
      setShowRejectModal(false);
      setSelectedRequest(null);
    }
  };

  const handleCancel = (requestId: string) => {
    Alert.alert('Cancelar solicitud', '¿Estás seguro de que deseas cancelar tu solicitud?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => {
          cancelRequest(requestId);
        },
      },
    ]);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En Revisión';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    // 👉 NUEVA LÓGICA: Unimos todas las mascotas y buscamos la que coincide con la solicitud
    const allPets = [...shelterPets, ...availablePets];
    // Soporta petId (camelCase) o pet_id (snake_case) dependiendo de tu backend
    const petId = item.petId || item.pet_id; 
    const foundPet = allPets.find(p => p.id === petId) || item.pet;

    // Extraemos los datos de la mascota encontrada
    const petName = foundPet?.name || 'Peludito';
    // Revisamos tanto imageUrl como image_url por si acaso
    const petImage = foundPet?.imageUrl || foundPet?.image_url; 
    
    const personName = isShelter 
        ? (item.adopter?.name || 'Familia Adoptante') 
        : (item.shelter?.name || 'Refugio');
    const personLevel = item.adopter?.experienceLevel || 'Principiante';

    return (
      <View style={styles.card}>
        {/* Mitad Superior: Foto de la Mascota */}
        <View style={styles.imageContainer}>
          {petImage ? (
            <Image source={{ uri: petImage }} style={styles.petImage} resizeMode="cover" />
          ) : (
            <View style={[styles.petImage, styles.imagePlaceholder]}>
              <IconSymbol name="pawprint.fill" color={PALETTE.textGray} size={40} />
            </View>
          )}
          
          {/* Badge del nombre de la mascota flotando sobre la imagen */}
          <View style={styles.petNameBadge}>
            <Text style={styles.petNameBadgeText}>{petName}</Text>
          </View>
          
          {/* Badge de estado en la esquina superior derecha */}
          {item.status !== 'pending' && (
            <View style={[styles.statusBadgeOverlay, item.status === 'approved' ? styles.statusApproved : styles.statusRejected]}>
              <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
            </View>
          )}
        </View>

        {/* Mitad Inferior: Contenido Blanco */}
        <View style={styles.cardContent}>
          
          {/* Header de la Info (Nombre y Avatar) */}
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoLeft}>
              <Text style={styles.personName} numberOfLines={1}>{personName}</Text>
              {isShelter && (
                <View style={styles.levelRow}>
                  <IconSymbol name="star" color={PALETTE.textDark} size={12} />
                  <Text style={styles.levelText}>Nivel: {personLevel}</Text>
                </View>
              )}
              {!isShelter && (
                <View style={styles.levelRow}>
                  <IconSymbol name="calendar" color={PALETTE.textGray} size={12} />
                  <Text style={styles.levelText}>
                    Enviada el {new Date(item.createdAt).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.avatarCircle}>
              <IconSymbol name="person.fill" color={PALETTE.avatarIcon} size={20} />
            </View>
          </View>

          {/* Tags / Atributos (Simulados basados en tu imagen) */}
          {isShelter && (
            <View style={styles.tagsRow}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>Casa con jardín</Text>
              </View>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>Sin otras mascotas</Text>
              </View>
            </View>
          )}

          {/* Mensaje del adoptante si existe */}
          {item.message && (
             <Text style={styles.requestMessage} numberOfLines={2}>"{item.message}"</Text>
          )}

          {/* Razón de rechazo si existe */}
          {item.rejectionReason && (
            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionTitle}>Motivo del rechazo:</Text>
              <Text style={styles.rejectionReason}>{item.rejectionReason}</Text>
            </View>
          )}

          {/* Botones de Acción: Refugio */}
          {isShelter && item.status === 'pending' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnAccept]}
                onPress={() => handleApprove(item.id)}
                disabled={isUpdating}
              >
                <Text style={styles.btnAcceptText}>Aceptar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.btnAction, styles.btnReject]}
                onPress={() => handleReject(item)}
                disabled={isUpdating}
              >
                <Text style={styles.btnRejectText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botones de Acción: Adoptante */}
          {!isShelter && item.status === 'pending' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnReject, { flex: 1, marginTop: 10 }]}
                onPress={() => handleCancel(item.id)}
                disabled={isCancelling}
              >
                <Text style={styles.btnRejectText}>Cancelar Solicitud</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Estilo Texto Limpio */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          {isShelter ? 'Solicitudes Recibidas' : 'Mis Solicitudes'}
        </Text>
        <Text style={styles.screenSubtitle}>
          {isShelter 
            ? 'Gestiona los nuevos hogares para tus rescatados.' 
            : 'Sigue el estado de tus solicitudes de adopción.'}
        </Text>
      </View>

      {/* Lista de Solicitudes */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PALETTE.primaryDark} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {isShelter ? 'No hay solicitudes nuevas' : 'Aún no has enviado solicitudes'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Rechazo (Manteniendo consistencia visual) */}
      <Modal visible={showRejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Rechazar solicitud</Text>
            <Text style={styles.modalSubtitle}>
              Puedes dejar un mensaje al adoptante explicando el motivo (opcional).
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ej: La mascota ya fue adoptada por otra familia..."
              placeholderTextColor={PALETTE.textGray}
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnReject]}
                onPress={() => setShowRejectModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.btnRejectText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAction, styles.btnAccept]}
                onPress={handleConfirmReject}
                disabled={isUpdating}
              >
                <Text style={styles.btnAcceptText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: PALETTE.bgLight 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: PALETTE.bgLight,
  },
  screenTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: PALETTE.textDark,
    marginBottom: 6,
  },
  screenSubtitle: { 
    fontSize: 14, 
    color: PALETTE.textGray, 
    lineHeight: 20,
  },
  listContent: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    gap: 20 
  },
  // --- CARD STYLES ---
  card: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petNameBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: PALETTE.white,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petNameBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.primaryDark,
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusApproved: { backgroundColor: PALETTE.primaryDark },
  statusRejected: { backgroundColor: PALETTE.dangerOutline },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.white,
  },
  cardContent: {
    padding: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.textDark,
    marginBottom: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 13,
    color: PALETTE.textDark,
    fontWeight: '500',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.avatarBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: PALETTE.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.primaryText,
  },
  requestMessage: {
    fontSize: 14,
    color: PALETTE.textGray,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  rejectionBox: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.dangerOutline,
    marginBottom: 2,
  },
  rejectionReason: {
    fontSize: 13,
    color: PALETTE.dangerOutline,
  },
  // --- ACTIONS ROW ---
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAccept: {
    backgroundColor: PALETTE.primaryDark,
  },
  btnAcceptText: {
    color: PALETTE.white,
    fontSize: 15,
    fontWeight: '700',
  },
  btnReject: {
    backgroundColor: PALETTE.white,
    borderWidth: 1.5,
    borderColor: PALETTE.dangerOutline,
  },
  btnRejectText: {
    color: PALETTE.dangerOutline,
    fontSize: 15,
    fontWeight: '700',
  },
  // --- EMPTY STATE & MODAL ---
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 30 
  },
  emptyTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: PALETTE.textGray, 
    textAlign: 'center' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: PALETTE.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: PALETTE.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: PALETTE.textDark, 
    marginBottom: 8 
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: PALETTE.textGray, 
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: PALETTE.bgLight,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: PALETTE.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
});