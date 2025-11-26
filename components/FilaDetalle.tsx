import React from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { Colors, Separador } from "./SharedStyles";

interface PropsFila {
  titulo: string;
  valor?: string | number;      // Opción A: Pasas un texto simple (ej. Monto)
  children?: React.ReactNode;   // Opción B: Pasas un Input o Selector
  conSeparador?: boolean;       // Por defecto true
}

export const FilaDetalle = ({ titulo, valor, children, conSeparador = true }: PropsFila) => {
  return (
    <View>
      <Contenedor>
        <Etiqueta>{titulo}</Etiqueta>
        
        <ContenedorDerecho>
          {/* Si hay 'valor' simple, lo muestra. Si no, muestra los 'children' (inputs) */}
          {valor !== undefined ? (
            <TextoValor>{valor}</TextoValor>
          ) : (
            children
          )}
        </ContenedorDerecho>
      </Contenedor>
      
      {conSeparador && <Separador style={{ marginVertical: 10 }} />}
    </View>
  );
};

// --- ESTILOS ---
const Contenedor = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const Etiqueta = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
  font-weight: bold;
  flex: 0.4; /* Ocupa el 40% izquierdo */
`;

const ContenedorDerecho = styled.View`
  flex: 0.6; /* Ocupa el 60% derecho */
  align-items: flex-end; /* Alinea contenido a la derecha */
`;

const TextoValor = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
`;