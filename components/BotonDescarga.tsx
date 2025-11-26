import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";
import { Colors } from "./SharedStyles"; // Importamos tus colores globales

interface PropsBotonDescarga {
  onPress: () => void;
  texto?: string;
  disabled?: boolean;
  cargando?: boolean; // Para mostrar el spinner
  estilo?: object;    // Para poder pasar márgenes extra si se necesita
}

export const BotonDescarga = ({ 
  onPress, 
  texto = "Descargar reporte", 
  disabled = false,
  cargando = false,
  estilo = {}
}: PropsBotonDescarga) => {
  return (
    <BotonContainer 
      onPress={onPress} 
      disabled={disabled || cargando} 
      style={estilo}
    >
      {cargando ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          <MaterialCommunityIcons name="download" size={20} color="white" />
          <TextoBoton>{texto}</TextoBoton>
        </>
      )}
    </BotonContainer>
  );
};

 // --- ESTILOS ---
 const BotonContainer = styled.TouchableOpacity<{ disabled: boolean }>`
   flex-direction: row;
   background-color: ${Colors.verde}; /* Usamos tu verde definido */
   padding: 8px 16px;
   border-radius: 20px; /* Estilo píldora */
   align-items: center;
   justify-content: center;
   shadow-color: #000;
   shadow-opacity: 0.2;
   shadow-offset: 0px 2px;
   elevation: 3;
   opacity: ${(p: { disabled: boolean }) => (p.disabled ? 0.7 : 1)};
 `;
 
 const TextoBoton = styled.Text`
   color: white;
   font-weight: bold;
   margin-left: 8px;
   font-size: 14px;
 `;