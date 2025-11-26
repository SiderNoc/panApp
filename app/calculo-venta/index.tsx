/* eslint-disable import/no-named-as-default */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import styled from "styled-components/native";

import {
  BotonCancelar,
  BotonCircular,
  BotonGuardar,
  CampoTexto,
  Colors,
  ContainerPadded,
  Etiqueta,
  TextoBoton,
  Titulo,
} from "@/components/SharedStyles";

import { useProductos } from "../../_context/ProductContext";
import { useVentas } from "../../_context/SaleContext";
import { SnackBar } from "../../components/SnackBar";

interface ItemVenta {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export default function CalculadoraVenta() {
  const router = useRouter();
  const { productos } = useProductos();
  const { registrarVenta } = useVentas();
  // Estados locales
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemVenta[]>([]);
  const [nombreProductoTemp, setNombreProductoTemp] = useState("");
  const [cantidadTemp, setCantidadTemp] = useState("");
  const [esVisibleSnackBar, setEsVisibleSnackBar] = useState(false);
  // Producto seleccionado basado en el nombre temporal
  const productoSeleccionado = useMemo(() => {
    if (!nombreProductoTemp) return undefined;
    const busqueda = nombreProductoTemp.toLowerCase();
    return productos.find((p) => p.nombre.toLowerCase().includes(busqueda));
  }, [nombreProductoTemp, productos]);

  const { cantidadTotal, montoTotal } = useMemo(() => {
    const cantidadTotal = itemsSeleccionados.reduce(
      (acc, item) => acc + item.cantidad,
      0
    );
    const montoTotal = itemsSeleccionados
      .reduce((acc, item) => acc + item.subtotal, 0)
      .toFixed(2);

    return { cantidadTotal, montoTotal };
  }, [itemsSeleccionados]);
  // Manejo de eventos
  const manejarAgregarItem = () => {
    const cant = parseInt(cantidadTemp);

    if (!productoSeleccionado || cant <= 0 || isNaN(cant)) {
      Alert.alert("Error", "Busca un producto y una cantidad válida.");
      return;
    }
    // Crear nuevo item de venta
    const precio = parseFloat(productoSeleccionado.precio);
    const subtotal = precio * cant;
    // Actualizar lista de items seleccionados
    const nuevoItem: ItemVenta = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      cantidad: cant,
      precio,
      subtotal,
    };

    setItemsSeleccionados((prev) => {
      const idx = prev.findIndex((i) => i.id === nuevoItem.id);
      if (idx >= 0) {
        const actualizado = [...prev];
        actualizado[idx] = {
          ...actualizado[idx],
          cantidad: actualizado[idx].cantidad + cant,
          subtotal: actualizado[idx].subtotal + subtotal,
        };
        return actualizado;
      }
      return [...prev, nuevoItem];
    });

    setNombreProductoTemp("");
    setCantidadTemp("");
  };

  const manejarEliminarItem = (idItem: string) => {
    setItemsSeleccionados((prev) => prev.filter((i) => i.id !== idItem));
  };

  const manejarRegistroVenta = async () => {
    const total = parseFloat(montoTotal);
    if (total <= 0) {
      Alert.alert("Error", "La venta debe contener al menos un producto.");
      return;
    }

    try {
      await registrarVenta({
        listaProductos: itemsSeleccionados,
        cantidadTotal,
        montoTotal: total,
      });

      setEsVisibleSnackBar(true);
      setTimeout(() => setEsVisibleSnackBar(false), 3000);
      setItemsSeleccionados([]);
    } catch {
      Alert.alert("Error de BD", "No se pudo registrar la venta.");
    }
  };

  return (
    <ContainerPadded>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
          <TituloCalc>Calcular Venta</TituloCalc>

          <EtiquetaCalc>Nombre del Producto:</EtiquetaCalc>
          <Fila>
            <Columna style={{ width: "54%" }}>
              <CampoCalc
                placeholder="Escribe el nombre"
                value={nombreProductoTemp}
                onChangeText={setNombreProductoTemp}
              />
            </Columna>

            <Columna style={{ width: "24%", marginLeft: "2%" }}>
              <CampoCalc
                placeholder="Cant."
                value={cantidadTemp}
                onChangeText={setCantidadTemp}
                keyboardType="numeric"
                style={{ textAlign: "center" }}
              />
            </Columna>

            <Columna
              style={{
                width: "18%",
                marginLeft: "2%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <BotonCircular
                onPress={manejarAgregarItem}
                disabled={!productoSeleccionado || parseFloat(cantidadTemp) <= 0}
                bgColor={Colors.verde}
              >
                <MaterialCommunityIcons
                  name="plus-thick"
                  size={24}
                  color="white"
                />
              </BotonCircular>
            </Columna>
          </Fila>

          {productoSeleccionado && (
            <EtiquetaDetalle>
              Producto encontrado: {productoSeleccionado.nombre} - $
              {productoSeleccionado.precio}
            </EtiquetaDetalle>
          )}
          {!productoSeleccionado && nombreProductoTemp.length > 0 && (
            <EtiquetaError>Producto no encontrado.</EtiquetaError>
          )}

          <Separador />

          <EtiquetaCalc>Detalle de la venta:</EtiquetaCalc>

          {itemsSeleccionados.map((item) => (
            <ContenedorItem key={item.id}>
              <DetalleItem>
                <TextoItem style={{ fontWeight: "bold" }}>
                  {item.nombre}
                </TextoItem>
                <TextoItem>
                  {item.cantidad} x ${item.precio.toFixed(2)}
                </TextoItem>
              </DetalleItem>

              <SubtotalItem>
                <TextoItem style={{ color: Colors.naranja }}>
                  ${item.subtotal.toFixed(2)}
                </TextoItem>

                <BotonEliminar onPress={() => manejarEliminarItem(item.id)}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.naranja}
                  />
                </BotonEliminar>
              </SubtotalItem>
            </ContenedorItem>
          ))}
        </ScrollView>

        <ContenedorPie>
          <TextoCantidad>
            Cantidad total de productos: {cantidadTotal}
          </TextoCantidad>

          <TextoTotal>Total a Pagar: ${montoTotal}</TextoTotal>

          <ContenedorBotones>
            <BotonCancelar 
                onPress={() => setItemsSeleccionados([])}
                style={{ width: '48%' }}
            >
              <TextoBoton>Limpiar</TextoBoton>
            </BotonCancelar>

            <BotonGuardar
              onPress={manejarRegistroVenta}
              disabled={parseFloat(montoTotal) <= 0}
              style={{ width: '48%', opacity: parseFloat(montoTotal) <= 0 ? 0.6 : 1 }}
            >
              <TextoBoton>Registrar Venta</TextoBoton>
            </BotonGuardar>
          </ContenedorBotones>

        </ContenedorPie>
      </KeyboardAvoidingView>

      <SnackBar
        mensaje="Venta registrada con éxito"
        esVisible={esVisibleSnackBar}
      />
    </ContainerPadded>
  );
}

// estilos

const TituloCalc = styled(Titulo)`
    margin-bottom: 5px;
`;

const EtiquetaCalc = styled(Etiqueta)`
    margin-bottom: 5px;
`;

const CampoCalc = styled(CampoTexto)`
    margin-bottom: 0;
    height: 50px;
`;

const Fila = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;
`;

const Columna = styled.View``;

const Separador = styled.View`
    height: 1px;
    background-color: #cccccc;
    margin: 10px 0;
`;

const EtiquetaDetalle = styled.Text`
    font-size: 14px;
    color: #4a4a4a;
    margin-bottom: 15px;
    margin-left: 10px;
`;

const EtiquetaError = styled.Text`
    font-size: 14px;
    color: #ff0000;
    margin-bottom: 15px;
    margin-left: 10px;
    font-weight: bold;
`;

const ContenedorItem = styled.View`
    flex-direction: row;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom-width: 1px;
    border-bottom-color: #eee;
`;

const DetalleItem = styled.View`
    flex-direction: column;
`;

const SubtotalItem = styled.View`
    flex-direction: row;
    align-items: center;
`;

const TextoItem = styled.Text`
    font-size: 16px;
    color: #4a4a4a;
`;

const BotonEliminar = styled.TouchableOpacity`
    margin-left: 15px;
    padding: 5px;
`;

const ContenedorBotones = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
`;

const ContenedorPie = styled.View`
    background-color: ${Colors.fondo};
    padding-top: 10px;
    padding-bottom: 20px;
    border-top-width: 1px;
    border-top-color: ${Colors.borde};
`;

const TextoCantidad = styled.Text`
    font-size: 16px;
    color: ${Colors.texto};
    text-align: right;
    margin-bottom: 5px;
`;

const TextoTotal = styled.Text`
    font-size: 28px;
    color: ${Colors.naranja};
    font-weight: bold;
    text-align: right;
    margin-bottom: 15px;
`;
