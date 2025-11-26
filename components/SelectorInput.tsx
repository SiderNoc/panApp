import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import styled from "styled-components/native";
import { Colors, Etiqueta } from "./SharedStyles";

interface PropsSelector {
  label?: string;        // Texto arriba (opcional)
  valor: string;         // Lo que se muestra dentro
  placeholder?: string;  // Si no hay valor
  icono?: keyof typeof MaterialCommunityIcons.glyphMap; // Nombre del ícono
  onPress: () => void;   // Acción al tocar
  estilo?: object;       // Para márgenes extra
}

export const SelectorInput = ({ 
  label, 
  valor, 
  placeholder = "Seleccionar", 
  icono = "chevron-down", 
  onPress,
  estilo = {}
}: PropsSelector) => {
  return (
    <Contenedor style={estilo}>
      {label && <Etiqueta style={{ marginBottom: 5 }}>{label}</Etiqueta>}
      
      <AreaTocable onPress={onPress}>
        <TextoValor hayValor={!!valor}>
            {valor || placeholder}
        </TextoValor>
        <MaterialCommunityIcons name={icono} size={24} color={Colors.naranja} />
      </AreaTocable>
    </Contenedor>
  );
};

// --- ESTILOS ---
const Contenedor = styled.View`
  width: 100%;
`;

const AreaTocable = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-width: 1px;
  border-color: ${Colors.naranja};
  background-color: #ffffff;
  border-radius: 8px;
  height: 50px; /* Misma altura que CampoTextoAlto */
  padding: 0 12px;
`;

const TextoValor = styled.Text<{ hayValor: boolean }>`
  font-size: 16px;
  color: ${(p: { hayValor: boolean }) => (p.hayValor ? Colors.texto : "#999")};
`;