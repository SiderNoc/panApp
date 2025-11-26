// SharedStyles.tsx
// Componentes base reutilizables para toda la app

import { Picker } from "@react-native-picker/picker";
import { TextInput } from "react-native";
import styled from "styled-components/native";

// =============================
// COLORES Y CONSTANTES BASE
// =============================
export const Colors = {
  fondo: "#f7f7f7",
  texto: "#4a4a4a",
  textoGris: "#9b9b9b",
  naranja: "#e98031",
  naranjaSuave: "#f5a623",
  verde: "#7ed321",
  rojo: "#ff0000",
  borde: "#cccccc",
  primary: "#e98031", 
  accent: "#f5a623",  
  
};

// =============================
// CONTENEDORES BASE
// =============================
export const Container = styled.View`
  flex: 1;
  background-color: ${Colors.fondo};
`;

export const ContainerPadded = styled(Container)`
  padding: 20px;
`;

export const LoadingView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const ContenedorBotonFijo = styled.View`
  width: 100%;
  padding: 15px;
  background-color: ${Colors.fondo}; 
  align-items: center;
  justify-content: center;
`;
// =============================
// TEXTOS BASE
// =============================
export const Titulo = styled.Text`
  font-size: 32px;
  font-weight: 900;
  color: ${Colors.naranja};
`;

export const Subtitulo = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${Colors.texto};
`;

export const Texto = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
`;

export const TextoInfo = styled.Text`
  font-size: 16px;
  color: ${Colors.textoGris};
`;

export const Etiqueta = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
  font-weight: bold;
`;

export const EtiquetaSmall = styled.Text`
  font-size: 14px;
  color: ${Colors.texto};
`;

export const TextoError = styled.Text`
  font-size: 14px;
  color: ${Colors.rojo};
  font-weight: bold;
`;

// =============================
// CAMPOS DE TEXTO
// =============================
export const CampoTexto = styled.TextInput`
  border-width: 1px;
  border-color: ${Colors.naranja};
  border-radius: 8px;
  padding: 10px 12px;
  color: ${Colors.texto};
  background-color: #ffffff;
`;

export const CampoTextoAlto = styled(CampoTexto)`
  height: 50px;
  font-size: 16px;
`;

export const StyledTextInput = styled(TextInput)`
  font-size: 16px;
  color: ${Colors.texto};
  width: 100%;
  height: 100%;
  padding: 0;
`;

// =============================
// PICKERS
// =============================
export const PickerContainer = styled.View`
  border-width: 1px;
  border-color: ${Colors.naranja};
  border-radius: 8px;
  height: 50px;
  justify-content: center;
  background-color: #ffffff;
  width: 100%;
`;

export const StyledPicker = styled(Picker)`
  width: 100%;
  color: ${Colors.texto};
  background-color: transparent;
`;

// =============================
// BOTONES
// =============================
export const BotonBase = styled.TouchableOpacity`
  padding: 12px 25px;
  border-radius: 8px;
  align-items: center;
`;

export const BotonGuardar = styled(BotonBase)`
  background-color: ${Colors.verde};
`;

export const BotonCancelar = styled(BotonBase)`
  background-color: ${Colors.naranjaSuave};
`;

export const BotonAccion = styled.TouchableOpacity`
  padding: 5px;
  margin-left: 10px;
`;

export const TextoBoton = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

// export const BotonCircular = styled.TouchableOpacity`
//   background-color: ${props => (props.disabled ? "#cccccc" : Colors.verde)};
//   width: 44px;
//   height: 44px;
//   border-radius: 22px;
//   align-items: center;
//   justify-content: center;
// `;
// 🔵 Botón Circular Global
export const BotonCircular = styled.TouchableOpacity<{
  size?: number;
  bgColor?: string;
  disabled?: boolean;
}>`
  background-color: ${({ disabled, bgColor }) =>
    disabled ? "#cccccc" : bgColor ?? Colors.verde};

  width: ${({ size }) => (size ? `${size}px` : "44px")};
  height: ${({ size }) => (size ? `${size}px` : "44px")};

  border-radius: ${({ size }) =>
    size ? `${size / 2}px` : "22px"};

  align-items: center;
  justify-content: center;
`;

// =============================
// FILAS Y COLUMNAS
// =============================
export const Fila = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const Columna = styled.View``;

export const Separador = styled.View`
  height: 1px;
  background-color: ${Colors.borde};
  margin: 10px 0;
`;

// =============================
// FOOTER Y LAYOUTS
// =============================
export const FooterContainer = styled.View`
  background-color: ${Colors.fondo};
  padding-top: 10px;
  padding-bottom: 20px;
  border-top-width: 1px;
  border-top-color: #e0e0e0;
`;

// =============================
// LISTAS Y TARJETAS BASE
// =============================
export const ItemContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

export const ItemTexto = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
`;

export const Tarjeta = styled.View`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  elevation: 2;
`;

// ... (Mantén todo lo anterior igual: Colors, Container, Botones, Inputs...)

// =============================
// ELEMENTOS DE TABLA (NUEVO)
// =============================
export const TablaContenedor = styled.View`
  flex: 1;
  background-color: #ffffff;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${Colors.naranja};
  overflow: hidden;
`;

export const TablaFila = styled.View<{ esEncabezado?: boolean }>`
  flex-direction: row;
  border-width: 1px;
  border-color: #e0e0e0;
  background-color: ${(p) => (p.esEncabezado ? "#f0f0f0" : "#ffffff")};
  margin-bottom: -1px;
  align-items: center;
  min-height: 45px;
`;

export const TablaCelda = styled.View<{ width: string }>`
  width: ${(p) => p.width};
  padding: 8px 5px;
  justify-content: center;
  align-items: center;
  border-right-width: 1px;
  border-right-color: #e0e0e0;
`;

export const TablaTexto = styled.Text<{ esEncabezado?: boolean; align?: string }>`
  font-size: 14px;
  color: #4a4a4a;
  font-weight: ${(p) => (p.esEncabezado ? "bold" : "normal")};
  text-align: ${(p) => p.align || "center"};
`;

// =============================
// MODALES (NUEVO)
// =============================
export const FondoModal = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ContenidoModal = styled.View`
  width: 85%;
  max-width: 500px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  align-items: center;
  elevation: 5;
`;

export const TituloModal = styled(Titulo)`
  font-size: 20px;
  margin-bottom: 20px;
`;

// =============================
// BOTONES TOGGLE / FILTROS (NUEVO)
// =============================
export const ContenedorFiltros = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 15px;
`;

export const BotonToggle = styled.TouchableOpacity<{ activo: boolean }>`
  flex: 1;
  background-color: ${(p) => (p.activo ? Colors.primary : "#eeeeee")};
  padding: 10px 0;
  border-radius: 8px;
  margin: 0 4px;
  align-items: center;
`;

export const TextoToggle = styled.Text<{ activo: boolean }>`
  color: ${(p) => (p.activo ? "white" : "#666666")};
  font-size: 14px;
  font-weight: ${(p) => (p.activo ? "bold" : "500")};
`;

// =============================
// ESTADOS DE CARGA / VACÍO (NUEVO)
// =============================
export const VistaCargando = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const TextoCargando = styled.Text`
  margin-top: 10px;
  font-size: 16px;
  color: ${Colors.texto};
`;

export const TextoVacio = styled.Text`
  text-align: center;
  padding: 30px;
  font-size: 16px;
  color: ${Colors.textoGris};
  font-style: italic;
`;