/* eslint-disable import/no-named-as-default */
import { BotonVolver } from "@/components/BotonVolver";
import {
  BotonCancelar,
  BotonGuardar,
  CampoTexto,
  ContainerPadded,
  Etiqueta,
  PickerContainer,
  StyledPicker,
  TextoBoton,
  Titulo
} from "@/components/SharedStyles";
import { SnackBar } from "@/components/SnackBar";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import styled from "styled-components/native";
import { useProductos } from "../../_context/ProductContext";

const TIPOS_PRODUCTO = ['Dulce', 'Salado', 'Danes', 'Hojaldrado'];

export default function AgregarProducto() {
  const { agregarProducto } = useProductos();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState(TIPOS_PRODUCTO[0]);
  const [precio, setPrecio] = useState("");

  // Estado para el SnackBar
  const [mostrarSnack, setMostrarSnack] = useState(false);
  const [mensajeSnack, setMensajeSnack] = useState("");

  const limpiarCampos = () => {
    setNombre("");
    setTipo(TIPOS_PRODUCTO[0]); 
    setPrecio("");
  };

  const manejarGuardado = async () => {
    const valorPrecio = parseFloat(precio);

    if (!nombre || !precio) {
        Alert.alert("Error", "Por favor, complete el nombre y el precio.");
        return;
    }
    
    if (isNaN(valorPrecio) || valorPrecio <= 0) {
        Alert.alert("Error de formato", "El precio debe ser un número positivo válido.");
        return;
    }
    
    try {
        await agregarProducto(nombre, tipo, valorPrecio.toFixed(2)); 
        setMensajeSnack("¡Producto agregado correctamente!");
        setMostrarSnack(true);
        limpiarCampos();
        setTimeout(() => {
            setMostrarSnack(false);
        }, 3000);
    } catch (e) {
        Alert.alert("Error", "Hubo un problema al guardar el producto.");
    }
  };
  
  const manejarCancelacion = () => {
      limpiarCampos();
      router.back();
  };

  return (
    <ContainerPadded>
      <BotonVolver />

      <TituloAddProducts>Agregar producto</TituloAddProducts>

      <EtiquetaAdd>Nombre del producto:</EtiquetaAdd>
      <CampoAdd
        placeholder="Ingrese el nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <EtiquetaAdd>Tipo:</EtiquetaAdd>
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

      <EtiquetaAdd>Precio:</EtiquetaAdd>
      <CampoAdd
        placeholder="Ingrese el precio"
        keyboardType="numeric"
        value={precio}
        onChangeText={setPrecio}
      />

      <ContenedorBotones>
        <BotonCancelar onPress={manejarCancelacion} style={{ width: '48%' }}>
          <TextoBoton>Cancelar</TextoBoton>
        </BotonCancelar>

        <BotonGuardar onPress={manejarGuardado} style={{ width: '48%' }}>
          <TextoBoton>Guardar</TextoBoton>
        </BotonGuardar>
      </ContenedorBotones>

      <SnackBar 
        esVisible={mostrarSnack}
        mensaje={mensajeSnack}
        tipo="exito"
      />
    </ContainerPadded>
  );
}

// estilos
const TituloAddProducts = styled(Titulo)` margin-bottom: 25px; `;
const EtiquetaAdd = styled(Etiqueta)` margin-bottom: 5px; `;
const CampoAdd = styled(CampoTexto)` margin-bottom: 20px; `;
const ContenedorBotones = styled.View` flex-direction: row; justify-content: space-between; margin-top: 20px; `;