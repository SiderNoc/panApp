/* eslint-disable import/no-named-as-default */
import { BotonVolver } from "@/components/BotonVolver";
import { SelectorInput } from "@/components/SelectorInput";
import * as S from "@/components/SharedStyles"; // SharedStyles
import { SnackBar } from "@/components/SnackBar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { usePedidos } from "../../_context/OrderContext";
import { useProductos } from "../../_context/ProductContext";

interface ItemPedido {
    id: string; 
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
}

// Generador de horas (Solo para Web)
const generarOpcionesHora = () => {
    const horas = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); 
    const minutos = Array.from({ length: 4 }, (_, i) => (i * 15).toString().padStart(2, '0')); 
    const ampm = ['AM', 'PM'];
    return { horas, minutos, ampm };
};
const { horas, minutos, ampm } = generarOpcionesHora();

export default function AgregarPedido() {
  const { agregarPedido } = usePedidos();
  const { productos } = useProductos(); 
  const router = useRouter();

  // --- Estados del Formulario ---
  const [nombreCliente, setNombreCliente] = useState("");
  const [fechaEntregaStr, setFechaEntregaStr] = useState(""); 
  const [anticipoStr, setAnticipoStr] = useState("");
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemPedido[]>([]); 

  // --- Estados de Fecha ---
  const [fecha, setFecha] = useState(new Date()); 
  const [mostrarPickerFecha, setMostrarPickerFecha] = useState(false);
  const [fechaTemp, setFechaTemp] = useState(new Date().toISOString().substring(0, 10)); 

  // --- Estados de Hora (Híbrido) ---
  const [horaEntrega, setHoraEntrega] = useState("10:00 AM"); 
  
  // Web: Modal Columnas
  const [esVisiblePickerHoraWeb, setVisiblePickerHoraWeb] = useState(false);
  const [horaModal, setHoraModal] = useState('10'); 
  const [minutoModal, setMinutoModal] = useState('00'); 
  const [ampmModal, setAmpmModal] = useState('AM'); 

  // Android: Picker Nativo
  const [mostrarPickerHoraNativo, setMostrarPickerHoraNativo] = useState(false);
  const [fechaHoraNativa, setFechaHoraNativa] = useState(new Date());

  // --- Estados de Búsqueda y UX ---
  const [nombreProductoTemp, setNombreProductoTemp] = useState("");
  const [cantidadTemp, setCantidadTemp] = useState("");
  const [mostrarSnack, setMostrarSnack] = useState(false);

  const productoSeleccionado = useMemo(() => {
    if (!nombreProductoTemp) return undefined;
    const busqueda = nombreProductoTemp.toLowerCase();
    return productos.find(p => p.nombre.toLowerCase().includes(busqueda));
  }, [nombreProductoTemp, productos]);

  const { totalItems, granTotal } = useMemo(() => {
    const totalItems = itemsSeleccionados.reduce((acc, item) => acc + item.cantidad, 0);
    const granTotal = itemsSeleccionados.reduce((acc, item) => acc + item.subtotal, 0);
    return { totalItems, granTotal: granTotal.toFixed(2) };
  }, [itemsSeleccionados]);
  
  const resetearCampos = () => {
    setNombreCliente("");
    setFechaEntregaStr("");
    setAnticipoStr("");
    setItemsSeleccionados([]);
    setHoraEntrega("10:00 AM");
    setNombreProductoTemp("");
    setCantidadTemp("");
    setFecha(new Date());
    setFechaTemp(new Date().toISOString().substring(0, 10));
  };

  // lógica de agregar y eliminar items
  const manejarAgregarItem = () => {
    const cantidad = parseInt(cantidadTemp);
    if (!productoSeleccionado || cantidad <= 0 || isNaN(cantidad)) {
      Alert.alert("Error", "Busca un producto y una cantidad válida.");
      return;
    }
    const precio = parseFloat(productoSeleccionado.precio);
    const subtotal = precio * cantidad;
    const nuevoItem: ItemPedido = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      cantidad: cantidad,
      precio: precio,
      subtotal: subtotal,
    };
    
    setItemsSeleccionados(prev => {
        const indiceExistente = prev.findIndex(item => item.id === nuevoItem.id);
        if(indiceExistente >= 0) {
            const actualizado = [...prev];
            actualizado[indiceExistente] = {
                ...nuevoItem,
                cantidad: actualizado[indiceExistente].cantidad + nuevoItem.cantidad,
                subtotal: actualizado[indiceExistente].subtotal + nuevoItem.subtotal,
            };
            return actualizado;
        } else return [...prev, nuevoItem];
    });
    setNombreProductoTemp("");
    setCantidadTemp("");
  };

  const manejarEliminarItem = (idItem: string) => {
    setItemsSeleccionados(prev => prev.filter(item => item.id !== idItem));
  };

  const manejarCancelar = () => {
      resetearCampos();
      router.back();
  };

  const manejarRegistro = async () => {
    const valorAnticipo = parseFloat(anticipoStr);
    if (!nombreCliente || !fechaEntregaStr || itemsSeleccionados.length === 0) {
      Alert.alert("Error", "Faltan datos esenciales.");
      return;
    }
    if (anticipoStr.length > 0 && (isNaN(valorAnticipo) || valorAnticipo < 0)) {
        Alert.alert("Error de formato", "El anticipo debe ser válido.");
        return;
    }
    
    try {
      await agregarPedido({
        nombreCliente,
        fechaEntregaStr, 
        horaEntrega,
        anticipoStr: valorAnticipo.toFixed(2),
        listaProductos: itemsSeleccionados.map(item => ({ id: item.id, cantidad: item.cantidad }))
      });
      setMostrarSnack(true);
      resetearCampos(); 
      setTimeout(() => setMostrarSnack(false), 3000);
    } catch (e) {
      Alert.alert("Error de BD", "No se pudo registrar el pedido.");
    }
  };

  const renderizarItemSeleccionado = ({ item }: { item: ItemPedido }) => (
    <S.ItemContainer>
        <DetalleItem>
            <S.ItemTexto style={{ fontWeight: 'bold' }}>{item.nombre}</S.ItemTexto>
            <S.ItemTexto>{item.cantidad} x ${item.precio.toFixed(2)}</S.ItemTexto>
        </DetalleItem>
        <SubtotalItem>
            <S.ItemTexto style={{ color: S.Colors.naranja }}>${item.subtotal.toFixed(2)}</S.ItemTexto>
            <BotonEliminar onPress={() => manejarEliminarItem(item.id)}>
                <Ionicons name="trash-outline" size={20} color={S.Colors.naranja} />
            </BotonEliminar>
        </SubtotalItem>
    </S.ItemContainer>
  );

  // logica de fecha
  const manejarCambioFecha = (evento: any, fechaSeleccionada: Date | undefined) => {
    if (Platform.OS !== 'ios') setMostrarPickerFecha(false);
    if (fechaSeleccionada) {
        setFecha(fechaSeleccionada); 
        const dia = String(fechaSeleccionada.getDate()).padStart(2, '0');
        const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, '0');
        const anio = fechaSeleccionada.getFullYear();
        setFechaEntregaStr(`${dia}/${mes}/${anio}`);
        if (Platform.OS === 'web') setFechaTemp(fechaSeleccionada.toISOString().substring(0, 10));
    }
  };
  const abrirPickerFecha = () => setMostrarPickerFecha(true);
  const confirmarFechaWeb = () => {
      const partesFecha = fechaTemp.split('-').map(Number);
      if (partesFecha.length === 3) {
          const fechaSeleccionada = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
          manejarCambioFecha(null, fechaSeleccionada);
      }
      setMostrarPickerFecha(false);
  };

  // logica de hora (híbrido)
  const abrirPickerHora = () => {
      if (Platform.OS === 'web') {
          const [tiempo, ap] = horaEntrega.split(' ');
          const [hora, minuto] = tiempo.split(':');
          setHoraModal(hora || '10'); setMinutoModal(minuto || '00'); setAmpmModal(ap || 'AM');
          setVisiblePickerHoraWeb(true);
      } else {
          // en android abrir picker nativo
          const d = new Date();
          const [time, modifier] = horaEntrega.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          if (!isNaN(hours)) { d.setHours(hours); d.setMinutes(minutes); }
          setFechaHoraNativa(d);
          setMostrarPickerHoraNativo(true);
      }
  };

  const manejarCambioHoraNativo = (event: any, selectedDate?: Date) => {
      setMostrarPickerHoraNativo(false);
      if (selectedDate) {
          let hours = selectedDate.getHours();
          const minutes = selectedDate.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12; hours = hours ? hours : 12;
          setHoraEntrega(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`);
      }
  };

  const confirmarHoraWeb = () => {
      setHoraEntrega(`${horaModal}:${minutoModal} ${ampmModal}`);
      setVisiblePickerHoraWeb(false);
  };

  return (
    <ContenedorPagina>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 180, paddingHorizontal: 20 }}>
            <BotonVolver />
            <TituloOverride>Agregar pedidos</TituloOverride>

            <LabelOverride>Cliente:</LabelOverride>
            <InputOverride placeholder="Nombre completo del cliente" value={nombreCliente} onChangeText={setNombreCliente} />

            {/* FECHAS */}
            <S.Fila style={{ marginBottom: 20 }}>
              <S.Columna style={{ width: '48%' }}>
                  <LabelOverride>Fecha de encargo: (Hoy)</LabelOverride>
                  <InputOverride value={new Date().toLocaleDateString('es-MX')} editable={false} style={{ backgroundColor: '#eeeeee' }} />
              </S.Columna>
              <S.Columna style={{ width: '48%' }}>
                  <SelectorInput 
                    label="Fecha de entrega:" 
                    valor={fechaEntregaStr} 
                    placeholder="DD/MM/AAAA" 
                    icono="calendar" 
                    onPress={abrirPickerFecha} 
                  />
              </S.Columna>
            </S.Fila>
            
            {Platform.OS !== 'web' && mostrarPickerFecha && (
                <DateTimePicker testID="dateTimePicker" 
                value={fecha} 
                mode={'date'} 
                display={'default'} 
                onChange={manejarCambioFecha} minimumDate={new Date()} />
            )}

            {/* ANTICIPO Y HORA */}
            <S.Fila style={{ marginBottom: 20 }}>
                <S.Columna style={{ width: '48%' }}>
                    <LabelOverride>Anticipo</LabelOverride>
                    <InputOverride placeholder="Ejemplo: $100" 
                    value={anticipoStr} 
                    onChangeText={setAnticipoStr} 
                    keyboardType="numeric" />
                </S.Columna>
                <S.Columna style={{ width: '48%' }}>
                    <SelectorInput 
                        label="Hora de entrega:" 
                        valor={horaEntrega} 
                        icono="clock-outline" 
                        onPress={abrirPickerHora} 
                    />
                </S.Columna>
            </S.Fila>

            {/* HORA NATIVA ANDROID */}
            {Platform.OS !== 'web' && mostrarPickerHoraNativo && (
                <DateTimePicker
                  value={fechaHoraNativa}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={manejarCambioHoraNativo}
                />
            )}
            {/* AGREGAR PRODUCTOS */}
            <LabelOverride>Añadir producto:</LabelOverride>

            <S.Fila style={{ marginBottom: 0, alignItems: 'flex-start' }}>
            <S.Columna style={{ width: '55%' }}>
                <InputOverride
                placeholder="Nombre del producto"
                value={nombreProductoTemp}
                onChangeText={setNombreProductoTemp}
                style={{ marginBottom: 0 }}
                />
            </S.Columna>

            <S.Columna style={{ width: '25%', paddingLeft: 10 }}>
                <InputOverride
                placeholder="Cant."
                value={cantidadTemp}
                onChangeText={setCantidadTemp}
                keyboardType="numeric"
                style={{ textAlign: 'center', marginBottom: 0 }}
                />
            </S.Columna>

            <S.Columna
                style={{
                width: '15%',
                paddingLeft: 10,
                justifyContent: 'center',
                paddingTop: 3,
                }}
            >
                <S.BotonCircular
                size={44}
                bgColor={S.Colors.verde}
                disabled={!productoSeleccionado || parseFloat(cantidadTemp) <= 0}
                onPress={manejarAgregarItem}
                >
                <MaterialCommunityIcons name="plus-thick" size={24} color="white" />
                </S.BotonCircular>
            </S.Columna>
            </S.Fila>

            <View style={{ marginBottom: 20, marginTop: 5 }}>
            {productoSeleccionado && (
                <EtiquetaDetalle>
                Producto: {productoSeleccionado.nombre} - ${productoSeleccionado.precio}
                </EtiquetaDetalle>
            )}

            {!productoSeleccionado && nombreProductoTemp.length > 0 && (
                <EtiquetaError>Producto no encontrado.</EtiquetaError>
            )}
            </View>

            <S.Separador />

            <LabelOverride>Detalle de Productos ({totalItems}):</LabelOverride>

            {itemsSeleccionados.map((item, index) => (
            <View key={index}>{renderizarItemSeleccionado({ item })}</View>
            ))}

            </ScrollView>


            {/* FOOTER */}
            <S.FooterContainer style={{ paddingHorizontal: 20 }}>
            <TextoTotal>Total: ${granTotal}</TextoTotal>

            <ContenedorBotones>
                <S.BotonCancelar
                onPress={manejarCancelar}
                style={{ width: '48%' }}
                >
                <S.TextoBoton>Cancelar</S.TextoBoton>
                </S.BotonCancelar>

                <S.BotonGuardar
                onPress={manejarRegistro}
                disabled={parseFloat(granTotal) <= 0}
                style={{
                    width: '48%',
                    opacity: parseFloat(granTotal) <= 0 ? 0.6 : 1,
                }}
                >
                <S.TextoBoton>Registrar</S.TextoBoton>
                </S.BotonGuardar>
            </ContenedorBotones>
            </S.FooterContainer>

            </KeyboardAvoidingView>

            {Platform.OS === 'web' && (
            <Modal
                animationType="fade"
                transparent={true}
                visible={mostrarPickerFecha}
                onRequestClose={() => setMostrarPickerFecha(false)}
            >
                <FondoModal>
                <ContenidoModal>
                    <TituloModal>Seleccionar Fecha</TituloModal>

                    <input
                    type="date"
                    value={fechaTemp}
                    onChange={(e) => setFechaTemp(e.target.value)}
                    style={{
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 15,
                        width: '100%',
                    }}
                    />

                    <BotonAccionModal onPress={confirmarFechaWeb}>
                    <S.TextoBoton>Confirmar</S.TextoBoton>
                    </BotonAccionModal>

                    <BotonAccionModal
                    bg={S.Colors.naranjaSuave}
                    onPress={() => setMostrarPickerFecha(false)}
                    style={{ marginTop: 10 }}
                    >
                    <S.TextoBoton>Cerrar</S.TextoBoton>
                    </BotonAccionModal>
                </ContenidoModal>
                </FondoModal>
            </Modal>
            )}

            {Platform.OS === 'web' && (
            <Modal
                animationType="slide"
                transparent={true}
                visible={esVisiblePickerHoraWeb}
                onRequestClose={() => setVisiblePickerHoraWeb(false)}
            >
                <FondoModal>
                <ContenidoModal style={{ width: '90%' }}>
                    <TituloModal>Seleccionar Hora</TituloModal>

                    <ContenedorPickerHora>

                    <ColumnaPickerHora>
                        <PickerEstilizado
                        selectedValue={horaModal}
                        onValueChange={(itemValue) => setHoraModal(itemValue)}
                        >
                        {horas.map((h) => (
                            <Picker.Item key={h} label={h} value={h} />
                        ))}
                        </PickerEstilizado>
                    </ColumnaPickerHora>

                    <SeparadorHora>:</SeparadorHora>

                    <ColumnaPickerHora>
                        <PickerEstilizado
                        selectedValue={minutoModal}
                        onValueChange={(itemValue) => setMinutoModal(itemValue)}
                        >
                        {minutos.map((m) => (
                            <Picker.Item key={m} label={m} value={m} />
                        ))}
                        </PickerEstilizado>
                    </ColumnaPickerHora>

                    <ColumnaPickerHora style={{ width: '30%' }}>
                        <PickerEstilizado
                        selectedValue={ampmModal}
                        onValueChange={(itemValue) => setAmpmModal(itemValue)}
                        >
                        {ampm.map((ap) => (
                            <Picker.Item key={ap} label={ap} value={ap} />
                        ))}
                        </PickerEstilizado>
                    </ColumnaPickerHora>

                    </ContenedorPickerHora>
                    <BotonAccionModal onPress={confirmarHoraWeb}>
                    <S.TextoBoton>Confirmar Hora</S.TextoBoton>
                    </BotonAccionModal>

                    <BotonAccionModal
                    bg={S.Colors.naranjaSuave}
                    onPress={() => setVisiblePickerHoraWeb(false)}
                    style={{ marginTop: 10 }}
                    >
                    <S.TextoBoton>Cancelar</S.TextoBoton>
                    </BotonAccionModal>
                </ContenidoModal>
                </FondoModal>
            </Modal>
            )}


            <SnackBar
            esVisible={mostrarSnack}
            mensaje="¡Pedido registrado con éxito!"
            tipo="exito"
            />

            </ContenedorPagina>

  );
}
// estilos
const ContenedorPagina = styled(S.Container)`
  padding: 20px;
  padding-bottom: 0;
`;

const TituloOverride = styled(S.Titulo)`
  margin-bottom: 25px;
`;

const LabelOverride = styled(S.Etiqueta)`
  margin-bottom: 5px;
`;

const InputOverride = styled(S.CampoTextoAlto)`
  margin-bottom: 20px;
`;

const EtiquetaDetalle = styled.Text`
  font-size: 14px;
  color: ${S.Colors.texto};
  margin-bottom: 15px;
  margin-left: 10px;
`;

const EtiquetaError = styled.Text`
  font-size: 14px;
  color: ${S.Colors.rojo};
  margin-bottom: 15px;
  margin-left: 10px;
  font-weight: bold;
`;

const DetalleItem = styled.View`
  flex-direction: column;
`;

const SubtotalItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BotonEliminar = styled.TouchableOpacity`
  margin-left: 15px;
  padding: 5px;
`;

const TextoTotal = styled.Text`
  font-size: 24px;
  color: ${S.Colors.texto};
  font-weight: bold;
  text-align: right;
  margin-bottom: 15px;
`;

const ContenedorBotones = styled(S.Fila)`
  margin-top: 10px;
  margin-bottom: 0;
`;

const FondoModal = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ContenidoModal = styled.View`
  width: 80%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  align-items: center;
`;

const TituloModal = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: ${S.Colors.texto};
`;

const BotonAccionModal = styled.TouchableOpacity<{ bg?: string }>`
  background-color: ${(props) => props.bg || S.Colors.verde};
  padding: 10px 20px;
  border-radius: 8px;
  width: 100%;
  align-items: center;
`;

const ContenedorPickerHora = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 150px;
  margin-bottom: 20px;
  background-color: ${S.Colors.fondo};
  border-radius: 8px;
  padding: 10px 0;
`;

const ColumnaPickerHora = styled.View`
  flex: 1;
  height: 100%;
  overflow: hidden;
`;

const PickerEstilizado = styled(S.StyledPicker)`
  height: 100%;
  width: 100%;
`;

const SeparadorHora = styled.Text`
  font-size: 30px;
  font-weight: bold;
  color: ${S.Colors.texto};
  margin: 0 5px;
  height: 150px;
  line-height: 150px;
`;
