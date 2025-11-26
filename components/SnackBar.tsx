import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "./SharedStyles";

type TipoMensaje = 'exito' | 'error' | 'info';

interface PropsSnackBar {
  mensaje: string;
  esVisible: boolean;
  tipo?: TipoMensaje;
  onDismiss?: () => void;
}

export const SnackBar = ({ 
  mensaje, 
  esVisible, 
  tipo = 'exito', 
  onDismiss 
}: PropsSnackBar) => {
  
  // 1. Estado para controlar el renderizado real
  // Esto reemplaza el hack de opacidad._value
  const [seMuestra, setSeMuestra] = useState(false);

  // Valores animados
  const opacidad = useRef(new Animated.Value(0)).current;
  const transladarY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (esVisible) {
      // Al mostrar: primero renderizamos, luego animamos
      setSeMuestra(true);
      
      Animated.parallel([
        Animated.timing(opacidad, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(transladarY, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
      
    } else {
      // Al ocultar: primero animamos, luego dejamos de renderizar
      Animated.parallel([
        Animated.timing(opacidad, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(transladarY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Callback al terminar la animación
        setSeMuestra(false);
        if (onDismiss) onDismiss();
      });
    }
  // 2. CORRECCIÓN ESLint: Agregamos todas las dependencias
  }, [esVisible, onDismiss, opacidad, transladarY]);

  // Configuración de colores e íconos
  const obtenerConfiguracion = () => {
    switch (tipo) {
      case 'error':
        return { color: Colors.rojo, icon: 'alert-circle' as const };
      case 'info':
        return { color: Colors.naranja, icon: 'information-circle' as const };
      case 'exito':
      default:
        return { color: Colors.verde, icon: 'checkmark-circle' as const };
    }
  };

  const config = obtenerConfiguracion();

  // 3. Renderizado condicional basado en estado, no en _value
  if (!seMuestra) return null;

  return (
    <Animated.View
      style={[
        estilos.contenedor,
        {
          backgroundColor: config.color,
          opacity: opacidad,
          transform: [{ translateY: transladarY }],
        },
      ]}
    >
      <View style={estilos.contenido}>
        <Ionicons name={config.icon} size={24} color="#fff" style={estilos.icono} />
        <Text style={estilos.texto}>{mensaje}</Text>
      </View>
    </Animated.View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  contenido: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icono: {
    marginRight: 10,
  },
  texto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
});