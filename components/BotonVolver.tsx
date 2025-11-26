import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styled from "styled-components/native";
import { Colors } from "./SharedStyles";

export const BotonVolver = () => {
  const router = useRouter();

  return (
    <Contenedor onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} color={Colors.naranja} />
    </Contenedor>
  );
};

// Estilos: Un círculo blanco con sombra sutil y borde naranja
const Contenedor = styled.TouchableOpacity`
  width: 45px;
  height: 45px;
  border-radius: 25px;
  background-color: #ffffff;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  border-width: 1px;
  border-color: ${Colors.naranja};
  
  /* Sombra */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;