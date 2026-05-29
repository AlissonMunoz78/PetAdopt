/**
 * CAPA: Presentation
 * Pantalla de mapa de refugios usando WebView + Leaflet + OpenStreetMap (Estilo Custom)
 */

import { useShelters } from '@features/shelters/presentation/hooks/useShelters';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { IconSymbol } from '../../components/ui/icon-symbol';

const CORAL = '#A86A5A';
const TEAL = '#0F6966'; // Ajustado para ser más similar al verde oscuro de la imagen

export default function SheltersMapScreen() {
  const { sheltersWithLocation, isLoading, error, refetch } = useShelters();
  const webViewRef = useRef<WebView>(null);
  const [webViewReady, setWebViewReady] = useState(false);

  // Generar HTML de Leaflet con diseño personalizado
  const generateMapHTML = () => {
    const markers = sheltersWithLocation
      .map((shelter, index) => {
        // Alternar iconos para dar el efecto de la imagen (puedes cambiar esta lógica luego según el tipo de refugio)
        const iconTypes = ['paw', 'home', 'heart'];
        const currentIcon = iconTypes[index % 3];
        
        return `
      {
        id: "${shelter.id}",
        lat: ${shelter.location?.latitude},
        lng: ${shelter.location?.longitude},
        name: "${shelter.username.replace(/"/g, '\\"')}",
        description: "${(shelter.description || '').replace(/"/g, '\\"')}",
        phone: "${shelter.phone || 'No disponible'}",
        address: "${(shelter.location?.address || 'Dirección no disponible').replace(/"/g, '\\"')}",
        iconType: "${currentIcon}"
      }
    `;
      })
      .join(',');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FCFAF8; }
        #map { width: 100vw; height: 100vh; }
        
        /* Ocultar controles por defecto para un look más limpio */
        .leaflet-control-zoom { display: none; }
        
        /* ESTILOS DE LOS MARCADORES PERSONALIZADOS */
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        .marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 120px;
          margin-left: -60px; /* Centrar absoluto */
          margin-top: -50px;
        }
        .marker-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          border: 2px solid white;
          z-index: 2;
        }
        .marker-label {
          background: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #222;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-top: -12px;
          z-index: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        /* ESTILOS DEL POPUP (TIPO TARJETA) */
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 260px !important;
        }
        .leaflet-popup-tip-container {
          display: none; /* Quitamos la flecha del popup para que parezca una tarjeta flotante */
        }
        
        .card-content {
          padding: 20px;
          background: white;
        }
        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #222;
          margin-bottom: 8px;
        }
        .card-info {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-info i { color: ${TEAL}; width: 14px; text-align: center; }
        .action-button {
          margin-top: 12px;
          background: ${TEAL};
          color: white;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Coordenadas centrales por defecto (Ecuador)
        const map = L.map('map', { zoomControl: false }).setView([-2.1962, -79.8862], 6);
        
        // Usamos CartoDB Voyager para un mapa limpio y con tonos suaves como en la imagen
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        
        const shelters = [${markers}];
        
        shelters.forEach(shelter => {
          // Lógica de colores según el icono
          const bgColor = shelter.iconType === 'heart' ? '${CORAL}' : '${TEAL}';
          
          // HTML del Marcador
          const markerHTML = \`
            <div class="marker-wrapper">
              <div class="marker-circle" style="background-color: \${bgColor};">
                <i class="fa-solid fa-\${shelter.iconType}"></i>
              </div>
              <div class="marker-label">\${shelter.name}</div>
            </div>
          \`;

          // HTML del Popup (Tarjeta de información)
          const popupContent = \`
            <div class="card-content">
              <div class="card-title">\${shelter.name}</div>
              <div class="card-info">
                <i class="fa-solid fa-location-dot"></i>
                <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${shelter.address}</span>
              </div>
              <div class="card-info">
                <i class="fa-solid fa-phone"></i>
                <span>\${shelter.phone}</span>
              </div>
            </div>
          \`;
          
          // Configurar el marcador personalizado
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: markerHTML,
            iconSize: [120, 80],
            iconAnchor: [60, 40], // Centro inferior
            popupAnchor: [0, -35] // Dónde aparece la tarjeta
          });

          L.marker([shelter.lat, shelter.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent);
        });
        
        // Ajustar la vista para que todos los marcadores sean visibles
        if (shelters.length > 0) {
          const group = new L.featureGroup(
            shelters.map(s => L.marker([s.lat, s.lng]))
          );
          map.fitBounds(group.getBounds().pad(0.2));
        }
        
        window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ready' }));
      </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'ready') {
      setWebViewReady(true);
    }
  };

  const handleRetry = () => {
    setWebViewReady(false);
    refetch();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" color={CORAL} size={40} />
          <Text style={styles.errorTitle}>Error al cargar refugios</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: CORAL }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (sheltersWithLocation.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <IconSymbol name="map" color={TEAL} size={50} />
          <Text style={styles.emptyTitle}>Sin ubicaciones</Text>
          <Text style={styles.emptyMessage}>
            Aún no hay refugios con ubicación registrada
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: TEAL }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Badge con contador */}
      <View style={styles.badge}>
        <IconSymbol name="location.fill" color="#fff" size={14} />
        <Text style={styles.badgeText}>
          {sheltersWithLocation.length} refugio{sheltersWithLocation.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* WebView con mapa */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHTML() }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={TEAL} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  badge: {
    position: 'absolute',
    top: 50, // Ajustado para evitar el notch/status bar
    left: 20,
    backgroundColor: TEAL,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FCFAF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FCFAF8',
  },
  loadingText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  emptyMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});