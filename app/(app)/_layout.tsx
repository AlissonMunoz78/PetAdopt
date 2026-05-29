import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Tabs } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { IconSymbol } from "../../components/ui/icon-symbol";

// 🎨 Nueva paleta de colores "Pet & Nature"
const PALETTE = {
  darkGreen: "#2D6A4F",   // Verde oscuro (Elegante, seguridad, Refugios)
  lightGreen: "#52B788",  // Verde claro (Fresco, amigable, Adoptantes)
  softYellow: "#FFF7D6",  // Amarillo clarito (Para fondos o acentos suaves)
  coralRed: "#E63946",    // Rojo coral (Para destacar corazones o alertas)
  gray: "#B7B7B7",        // Gris para íconos inactivos
  white: "#FFFFFF",
};

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isShelter = user?.role === "shelter";

  // El color principal cambia según el rol para dar identidad visual adaptativa
  const primaryColor = isShelter ? PALETTE.darkGreen : PALETTE.lightGreen;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { 
          backgroundColor: primaryColor,
          shadowColor: "transparent", 
          elevation: 0, 
        },
        headerTintColor: PALETTE.white,
        headerTitleStyle: { 
          fontWeight: "800", 
          fontSize: 20, 
          letterSpacing: 0.5 
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: PALETTE.gray,
        tabBarStyle: { 
          backgroundColor: PALETTE.white,
          borderTopWidth: 0, 
          shadowColor: primaryColor, 
          shadowOffset: { width: 0, height: -4 }, 
          shadowOpacity: 0.08, 
          shadowRadius: 12, 
          elevation: 15, 
          height: 65, 
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: "700",
          marginTop: -4 
        },
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={[styles.rolePill, { backgroundColor: isShelter ? "#1B4332" : "#40916C" }]}>
              <Text style={styles.rolePillText}>
                {isShelter ? "Refugio" : "Adoptante"}
              </Text>
            </View>
          </View>
        ),
      }}
    >
      {/* Mascotas (listado para adoptantes, gestión para refugios) */}
      <Tabs.Screen
        name="index"
        options={{
          title: isShelter ? "Mi Refugio" : "Mascotas",
          tabBarLabel: isShelter ? "Refugio" : "Explorar",
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              name={isShelter ? "house.fill" : "pawprint.fill"} 
              color={color} 
              size={24} 
            />
          ),
        }}
      />

      {/* Mis mascotas - solo para refugios */}
      <Tabs.Screen
        name="pets/my-pets/index"
        options={{
          href: isShelter ? "/pets/my-pets" : null,
          title: "Gestionar mascotas",
          tabBarLabel: "Mis mascotas",
          tabBarIcon: ({ color }) => <IconSymbol name="square.and.pencil" color={color} size={24} />,
        }}
      />

      {/* Solicitudes de adopción */}
      <Tabs.Screen
        name="pets/adoption-requests/index"
        options={{
          title: isShelter ? "Solicitudes" : "Mis solicitudes",
          tabBarLabel: "Solicitudes",
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              name="heart.fill" 
              color={color} 
              size={24} 
            />
          ),
        }}
      />

      {/* Mapa de refugios - para ambos roles */}
      <Tabs.Screen
        name="shelters-map"
        options={{
          title: "Mapa de Refugios",
          tabBarLabel: "Mapa",
          tabBarIcon: ({ color }) => <IconSymbol name="map.fill" color={color} size={24} />,
        }}
      />

      {/* Asistente IA - para ambos roles */}
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: "Asistente Veterinario",
          tabBarLabel: "Asistente",
          tabBarIcon: ({ color }) => <IconSymbol name="message.fill" color={color} size={24} />,
        }}
      />

      {/* Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mi Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} size={24} />,
        }}
      />

      {/* 🚫 Pantallas ocultas del tab bar */}
      <Tabs.Screen name="[petId]" options={{ href: null, title: "Detalles", headerShown: true }} />
      <Tabs.Screen name="pets/my-pets/[petId]/edit" options={{ href: null, title: "Editar mascota", headerShown: true }} />
      <Tabs.Screen name="pets/my-pets/create" options={{ href: null, title: "Crear mascota", headerShown: true }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginRight: 16,
  },
  rolePill: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  rolePillText: { 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "800",
    textTransform: "uppercase", 
    letterSpacing: 0.5,
  },
});