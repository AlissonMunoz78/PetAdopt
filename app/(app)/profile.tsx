/**
 * CAPA: Presentación
 * Pantalla de perfil del usuario con mapa, ubicación actual o manual.
 * Diseño modernizado y limpio tipo "Voyager".
 */
import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { IconSymbol } from "../../components/ui/icon-symbol";
import LottieView from "lottie-react-native";

import Adios from "../../assets/animations/adios.json";

const CORAL = "#A86A5A";
const TEAL  = "#0F6966"; // Ajustado para mantener consistencia con el mapa anterior

// Estilo JSON para limpiar el mapa nativo (similar a CartoDB Voyager)
const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b2a6" }] },
  { featureType: "administrative.land_parcel", elementType: "geometry.stroke", stylers: [{ color: "#dcd2be" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#ae9e90" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#93817c" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#a5b076" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#447530" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f1e6" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fdfcf8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c967" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e9bc62" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#e98d58" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry.stroke", stylers: [{ color: "#db8555" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#806b63" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "transit.line", elementType: "labels.text.fill", stylers: [{ color: "#8f7d77" }] },
  { featureType: "transit.line", elementType: "labels.text.stroke", stylers: [{ color: "#ebe3cd" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#dfd2ae" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#b9d3c2" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#92998d" }] }
];

export default function ProfileScreen() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const { logout, updateLocation, isUpdatingLocation } = useAuth();

  const isShelter = user?.role === "shelter";
  const accent = isShelter ? CORAL : TEAL;

  const [mapRegion, setMapRegion] = useState({
    latitude:       user?.location?.latitude  ?? -2.1962,
    longitude:      user?.location?.longitude ?? -79.8862,
    latitudeDelta:  0.05,
    longitudeDelta: 0.05,
  });
  
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(
    user?.location ? { latitude: user.location.latitude, longitude: user.location.longitude } : null
  );
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para la animación de salida

  const handleGetCurrentLocation = async () => {
    setLoadingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos acceso a tu ubicación para centrar el mapa.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setSelectedCoords(coords);
      setMapRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch {
      Alert.alert("Error", "No se pudo obtener tu ubicación actual.");
    } finally {
      setLoadingGPS(false);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
  };

  const handleSaveLocation = async () => {
    if (!selectedCoords) {
      Alert.alert("Sin ubicación", "Toca el mapa o usa tu ubicación actual antes de guardar.");
      return;
    }
    updateLocation({
      latitude:  selectedCoords.latitude,
      longitude: selectedCoords.longitude,
    });
    Alert.alert("✅ Ubicación guardada", "Tu perfil ha sido actualizado correctamente.");
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Esperamos 2.5 segundos para que la animación se vea antes de cerrar sesión
    setTimeout(() => {
      logout();
    }, 2500); 
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Cabecera del Perfil */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: accent }]}>
            <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() ?? "?"}</Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={[styles.roleBadge, { backgroundColor: accent + "15", borderColor: accent + "40" }]}>
            <IconSymbol name={isShelter ? "building.2.fill" : "pawprint.fill"} color={accent} size={14} />
            <Text style={[styles.roleText, { color: accent }]}>{isShelter ? "Refugio Registrado" : "Adoptante"}</Text>
          </View>
        </View>

        {/* Tarjeta de Ubicación */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: accent + "15" }]}>
              <IconSymbol name="map.fill" color={accent} size={18} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Área de Operación</Text>
              <Text style={styles.cardSubtitle}>
                Toca el mapa para ajustar tu posición exacta.
              </Text>
            </View>
          </View>

          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
              customMapStyle={mapStyle} // Aplica el estilo limpio al mapa
            >
              {/* MARCADOR PERSONALIZADO NATIVO */}
              {selectedCoords && (
                <Marker coordinate={selectedCoords} title="Tu ubicación">
                  <View style={styles.customMarkerWrapper}>
                    <View style={[styles.customMarkerCircle, { backgroundColor: accent }]}>
                      <IconSymbol name={isShelter ? "house.fill" : "person.fill"} color="#FFF" size={18} />
                    </View>
                    <View style={styles.customMarkerShadow} />
                  </View>
                </Marker>
              )}
            </MapView>
          </View>

          {selectedCoords && (
            <View style={styles.coordsBox}>
              <IconSymbol name="location.viewfinder" color="#888" size={14} />
              <Text style={styles.coordsText}>
                {selectedCoords.latitude.toFixed(5)}, {selectedCoords.longitude.toFixed(5)}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: accent }]}
              onPress={handleGetCurrentLocation}
              disabled={loadingGPS}
              activeOpacity={0.7}
            >
              {loadingGPS ? (
                <ActivityIndicator color={accent} size="small" />
              ) : (
                <>
                  <IconSymbol name="location.fill" color={accent} size={16} />
                  <Text style={[styles.btnOutlineText, { color: accent }]}>Mi GPS</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: accent }, isUpdatingLocation && styles.btnDisabled]}
              onPress={handleSaveLocation}
              disabled={isUpdatingLocation}
              activeOpacity={0.8}
            >
              {isUpdatingLocation ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>Guardar Posición</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Cerrar Sesión (Ahora llama a handleLogout) */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.8}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" color="#fff" size={18} />
          <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* OVERLAY DE DESPEDIDA */}
      {isLoggingOut && (
        <View style={styles.logoutOverlay}>
          <LottieView
            autoPlay
            loop={false}
            source={Adios} // <-- REEMPLAZA ESTO CON EL NOMBRE DE TU LOTTIE
            style={styles.lottieLogout}
          />
          <Text style={styles.logoutMessage}>¡Hasta pronto!</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F4F6F8" 
  },
  content: { 
    padding: 20, 
    alignItems: "center", 
    paddingBottom: 80 
  },
  
  // Header
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  avatarCircle: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 16, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10, 
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFF"
  },
  avatarText: { color: "#fff", fontSize: 40, fontWeight: "800" },
  username: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", marginBottom: 4, letterSpacing: -0.5 },
  email: { fontSize: 15, color: "#666", marginBottom: 14 },
  roleBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 6 
  },
  roleText: { fontSize: 13, fontWeight: "700" },

  // Tarjeta (Card)
  card: { 
    width: "100%", 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 24, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 12, 
    elevation: 3 
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", marginBottom: 2 },
  cardSubtitle: { fontSize: 13, color: "#888" },
  
  // Mapa
  mapWrapper: { 
    borderRadius: 16, 
    overflow: "hidden", 
    marginBottom: 12, 
    height: 240, 
    backgroundColor: "#EFEFEF", 
  },
  map: { flex: 1 },
  
  // Estilos del Marcador Personalizado
  customMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarkerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  customMarkerShadow: {
    width: 12,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1,
  },

  coordsBox: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F8F9FA", 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 16, 
  },
  coordsText: { fontSize: 13, color: "#666", fontFamily: "monospace", letterSpacing: 0.5 },
  
  // Botones
  actionRow: { flexDirection: "row", gap: 12 },
  btnOutline: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 6, 
    borderWidth: 1.5, 
    borderRadius: 14, 
    paddingVertical: 14 
  },
  btnOutlineText: { fontSize: 14, fontWeight: "700" },
  btnPrimary: { 
    flex: 1.5, 
    alignItems: "center", 
    justifyContent: "center", 
    borderRadius: 14, 
    paddingVertical: 14 
  },
  btnPrimaryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
  
  // Logout
  btnLogout: { 
    width: "100%", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    backgroundColor: "#FF5252", 
    borderRadius: 16, 
    paddingVertical: 16, 
    shadowColor: "#FF5252", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4 
  },
  btnLogoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Estilos para el overlay de cierre de sesión
  logoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Asegura que quede por encima de todo
  },
  lottieLogout: {
    width: 200,
    height: 200,
  },
  logoutMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 10,
  }
});