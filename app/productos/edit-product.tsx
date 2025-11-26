import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import styled from "styled-components/native";

import {
  BotonCancelar,
  BotonGuardar,
  CampoTexto,
  ContainerPadded,
  Etiqueta,
  PickerContainer,
  StyledPicker,
  TextoBoton,
  Titulo,
} from "@/components/SharedStyles";

import { BotonVolver } from "@/components/BotonVolver";
import { SnackBar } from "@/components/SnackBar"; // <--- 1. Importar SnackBar
import { useProductos } from "../../_context/ProductContext";

export default function EditarProducto() {
  const { obtenerProductoPorId, actualizarProducto } = useProductos();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const TIPOS_PRODUCTO = ["Dulce", "Salado", "Danes", "Hojaldrado"];

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");

  // estado para controlar la visibilidad del SnackBar
  const [mostrarSnack, setMostrarSnack] = useState(false);

  useEffect(() => {
    if (id) {
      const producto = obtenerProductoPorId(String(id));
      if (producto) {
        setNombre(producto.nombre);
        setTipo(producto.tipo);
        setPrecio(producto.precio);
      }
    }
  }, [id, obtenerProductoPorId]);

  const manejarGuardado = async () => {
    // Validaciones antes de guardar
    if (!id || !nombre || !precio) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
    }

    const precioNum = parseFloat(precio);
    if(isNaN(precioNum) || precioNum <= 0) {
        Alert.alert("Error", "El precio debe ser válido");
        return;
    }

    try {
        // actualizar el producto
        await actualizarProducto(String(id), nombre, tipo, precio);
        
        // mostrar el SnackBar
        setMostrarSnack(true);

        // cerrar el SnackBar y volver atrás después de 1.5 segundos
        setTimeout(() => {
            setMostrarSnack(false);
            router.back();
        }, 1500);

    } catch (error) {
        Alert.alert("Error", "No se pudo actualizar el producto");
    }
  };

  return (
    <ContainerPadded>
      <BotonVolver />

      <TituloEdit>Modificar producto</TituloEdit>

      <EtiquetaEdit>Nombre del producto:</EtiquetaEdit>
      <CampoEdit
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ingrese el nuevo nombre"
      />

      <EtiquetaEdit>Tipo:</EtiquetaEdit>
      <PickerContainer>
        <StyledPicker
          selectedValue={tipo}
          onValueChange={(itemValue) => setTipo(itemValue)}
        >
          {TIPOS_PRODUCTO.map((item, index) => (
            <Picker.Item key={index} label={item} value={item} />
          ))}
        </StyledPicker>
      </PickerContainer>

      <EtiquetaEdit>Precio:</EtiquetaEdit>
      <CampoEdit
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        placeholder="Ingrese el nuevo precio"
      />

      <ContenedorBotones>
        <BotonCancelar onPress={() => router.back()}>
          <TextoBoton>Cancelar</TextoBoton>
        </BotonCancelar>

        <BotonGuardar onPress={manejarGuardado}>
          <TextoBoton>Guardar</TextoBoton>
        </BotonGuardar>
      </ContenedorBotones>

      <SnackBar 
        esVisible={mostrarSnack}
        mensaje="¡Cambios guardados correctamente!"
        tipo="exito"
      />

    </ContainerPadded>
  );
}


// estilos


const TituloEdit = styled(Titulo)`
  margin-bottom: 25px;
`;

const EtiquetaEdit = styled(Etiqueta)`
  margin-bottom: 5px;
`;

const CampoEdit = styled(CampoTexto)`
  margin-bottom: 20px;
`;

const ContenedorBotones = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`;