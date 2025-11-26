import React from "react";
import { ActivityIndicator, Modal } from "react-native";
import styled from "styled-components/native";
import {
    BotonAccion,
    Colors,
    ContenidoModal,
    FondoModal,
    TextoBoton,
    TituloModal,
} from "./SharedStyles";

interface PropsModal {
  visible: boolean;
  titulo: string;
  children?: React.ReactNode; // Aquí va el texto o contenido del cuerpo
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  esPeligroso?: boolean; // Si es true (borrar), el botón es Rojo. Si no, Verde.
  cargando?: boolean;    // Para mostrar spinner en el botón de confirmar
}

export const ModalConfirmacion = ({
  visible,
  titulo,
  children,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirm,
  onCancel,
  esPeligroso = false,
  cargando = false,
}: PropsModal) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <FondoModal>
        <ContenidoModal>
          <TituloModal>{titulo}</TituloModal>

          {/* Contenedor flexible para el contenido */}
          <CuerpoModal>{children}</CuerpoModal>

          <ContenedorBotones>
            {/* Botón Confirmar (Opcional, a veces solo queremos cerrar) */}
            {onConfirm && (
              <BotonAccion
                onPress={onConfirm}
                disabled={cargando}
                style={{
                  backgroundColor: esPeligroso ? Colors.rojo : Colors.verde,
                  width: "100%",
                  marginBottom: 10,
                  opacity: cargando ? 0.7 : 1,
                }}
              >
                {cargando ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <TextoBoton>{textoConfirmar}</TextoBoton>
                )}
              </BotonAccion>
            )}

            {/* Botón Cancelar */}
            <BotonAccion
              onPress={onCancel}
              disabled={cargando}
              style={{
                backgroundColor: Colors.naranjaSuave,
                width: "100%",
              }}
            >
              <TextoBoton>{textoCancelar}</TextoBoton>
            </BotonAccion>
          </ContenedorBotones>
        </ContenidoModal>
      </FondoModal>
    </Modal>
  );
};

// Estilos locales para organizar el layout interno
const CuerpoModal = styled.View`
  width: 100%;
  margin-bottom: 20px;
`;

const ContenedorBotones = styled.View`
  width: 100%;
`;