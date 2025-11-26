import { FilaDetalle } from "@/components/FilaDetalle";
import { ModalConfirmacion } from "@/components/ModalConfirmacion"; // <--- NUEVO
import { SelectorInput } from "@/components/SelectorInput";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import { ProductoPedido, usePedidos } from "../../_context/OrderContext";
import { useProductos } from "../../_context/ProductContext";
import {
  BotonAccion,
  BotonCancelar,
  BotonCircular,
  BotonGuardar,
  CampoTexto,
  Colors,
  ContainerPadded,
  Etiqueta,
  Fila,
  LoadingView,
  PickerContainer as PickerContGlobal,
  StyledPicker as StyledPickerGlobal,
  StyledTextInput,
  Tarjeta as TarjetaGlobal,
  TextoBoton,
  Texto as TextoGlobal,
  TextoInfo,
  Titulo
} from "../../components/SharedStyles";

// Componentes
import { BotonVolver } from "@/components/BotonVolver";
import { SnackBar } from "@/components/SnackBar";


// Tipos
type EstadoPedido = 'En proceso' | 'Entregado' | 'Cancelado'; 
type EstadoPago = 'Pendiente' | 'Pagado' | 'Reembolsado';
const ESTADOS_PEDIDO: EstadoPedido[] = ['En proceso', 'Entregado', 'Cancelado'];
const ESTADOS_PAGO: EstadoPago[] = ['Pendiente', 'Pagado', 'Reembolsado'];

// Generador de horas
const generarOpcionesHora = () => {
  const horas = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutos = Array.from({ length: 4 }, (_, i) => (i * 15).toString().padStart(2, '0'));
  const ampm = ['AM', 'PM'];
  return { horas, minutos, ampm };
};
const { horas, minutos, ampm } = generarOpcionesHora();

export default function DetallePedido() {
  const { id: idPedido } = useLocalSearchParams();
  const { 
      pedidos, 
      obtenerProductosPedido, 
      establecerEstadoPedido, 
      establecerEstadoPago, 
      actualizarCampoPedido,
      agregarItemPedido,
      eliminarItemPedido
  } = usePedidos();
  
  const { productos } = useProductos(); 

  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [productosPedido, setProductosPedido] = useState<ProductoPedido[]>([]);
  
  // SnackBar
  const [mostrarSnack, setMostrarSnack] = useState(false);
  const [mensajeSnack, setMensajeSnack] = useState("");
  const [tipoSnack, setTipoSnack] = useState<'exito' | 'info' | 'error'>('exito');

  const pedido = useMemo(() => pedidos.find(o => o.id === idPedido), [pedidos, idPedido]);

  // estados locales para edición
  const [nombreLocal, setNombreLocal] = useState("");
  const [anticipoLocal, setAnticipoLocal] = useState("");
  const [fechaLocal, setFechaLocal] = useState<Date | null>(null);
  const [horaLocal, setHoraLocal] = useState("");

  // estados para agregar producto
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [busquedaProd, setBusquedaProd] = useState("");
  const [cantidadProd, setCantidadProd] = useState("");

  // estados para pickers fecha/hora
  
  // Fecha
  const [mostrarPickerFecha, setMostrarPickerFecha] = useState(false);
  const [fechaTemp, setFechaTemp] = useState(""); // Web

  // hora web
  const [esVisiblePickerHoraWeb, setVisiblePickerHoraWeb] = useState(false);
  const [horaModal, setHoraModal] = useState('10');
  const [minutoModal, setMinutoModal] = useState('00');
  const [ampmModal, setAmpmModal] = useState('AM');

  // hora nativa
  const [mostrarPickerHoraNativo, setMostrarPickerHoraNativo] = useState(false);
  const [fechaHoraNativa, setFechaHoraNativa] = useState(new Date());

  // Sincronización inicial
  useEffect(() => {
    if (pedido) {
        setNombreLocal(pedido.nombreCliente || "");
        setAnticipoLocal(pedido.anticipo ? pedido.anticipo.toString() : "0");
        setFechaLocal(pedido.fechaEntrega ? pedido.fechaEntrega.toDate() : new Date());
        setHoraLocal(pedido.horaEntrega || "10:00 AM");
    }
  }, [pedido]);

  // Cargar productos
  const recargarProductos = useCallback(() => {
    if (idPedido && typeof idPedido === 'string') {
      setCargandoProductos(true);
      obtenerProductosPedido(idPedido)
        .then(data => setProductosPedido(data))
        .catch(e => console.error(e))
        .finally(() => setCargandoProductos(false));
    }
  }, [idPedido, obtenerProductosPedido]);

// Cargar productos al inicio o cuando cambie la función
  useEffect(() => {
    recargarProductos();
  }, [recargarProductos]);

  // Notificaciones
  const notificar = (msg: string, tipo: 'exito' | 'info' | 'error' = 'exito') => {
      setMensajeSnack(msg);
      setTipoSnack(tipo);
      setMostrarSnack(true);
      setTimeout(() => setMostrarSnack(false), 3000);
  };

  // Buscar producto
  const productoEncontrado = useMemo(() => {
    if (!busquedaProd) return undefined;
    return productos.find(p => p.nombre.toLowerCase().includes(busquedaProd.toLowerCase()));
  }, [busquedaProd, productos]);

  // Detectar cambios
  const hayCambios = useMemo(() => {
      if (!pedido) return false;
      const fechaOriginal = pedido.fechaEntrega ? pedido.fechaEntrega.toDate().toLocaleDateString('es-MX') : "";
      const fechaNueva = fechaLocal ? fechaLocal.toLocaleDateString('es-MX') : "";
      return (
          nombreLocal !== pedido.nombreCliente ||
          parseFloat(anticipoLocal || "0") !== pedido.anticipo ||
          fechaNueva !== fechaOriginal ||
          horaLocal !== pedido.horaEntrega
      );
  }, [pedido, nombreLocal, anticipoLocal, fechaLocal, horaLocal]);

  if (!pedido) return <LoadingView><ActivityIndicator size="large" color={Colors.naranja} /></LoadingView>;

  // lógica agregar producto
  const manejarAgregarProducto = async () => {
      const cant = parseInt(cantidadProd);
      if (!productoEncontrado || isNaN(cant) || cant <= 0) {
          Alert.alert("Error", "Datos inválidos");
          return;
      }
      try {
          const nuevoItem = {
              idProducto: productoEncontrado.id,
              nombreProducto: productoEncontrado.nombre,
              cantidad: cant,
              subtotal: parseFloat(productoEncontrado.precio) * cant
          };
          await agregarItemPedido(pedido.id, nuevoItem);
          notificar("Producto agregado");
          setModalAgregarVisible(false);
          setBusquedaProd("");
          setCantidadProd("");
          recargarProductos();
      } catch (e) {
          notificar("Error al agregar", "error");
      }
  };

  const confirmarEliminarProducto = (item: ProductoPedido) => {
      if (!item.id) return;
      Alert.alert("Eliminar", `¿Quitar ${item.nombreProducto}?`, [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: async () => {
              try {
                  await eliminarItemPedido(pedido.id, item.id!, item.subtotal);
                  notificar("Producto eliminado");
                  recargarProductos();
              } catch(e) { notificar("Error", "error"); }
          }}
      ]);
  };

  // logica guardar/cancelar cambios
  const manejarGuardarCambios = async () => {
      const valorAnticipo = parseFloat(anticipoLocal);
      if (isNaN(valorAnticipo) || valorAnticipo < 0) return notificar("Anticipo inválido", "error");
      if (!nombreLocal.trim()) return notificar("Nombre vacío", "error");

      try {
          if (nombreLocal !== pedido.nombreCliente) await actualizarCampoPedido(pedido.id, 'nombreCliente', nombreLocal);
          if (valorAnticipo !== pedido.anticipo) await actualizarCampoPedido(pedido.id, 'anticipo', valorAnticipo);
          
          if (fechaLocal) {
            const d = fechaLocal;
            const fStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
            const fOrig = pedido.fechaEntrega?.toDate().toLocaleDateString('es-MX');
            if (d.toLocaleDateString('es-MX') !== fOrig) await actualizarCampoPedido(pedido.id, 'fechaEntrega', fStr);
          }
          if (horaLocal !== pedido.horaEntrega) await actualizarCampoPedido(pedido.id, 'horaEntrega', horaLocal);

          notificar("Cambios guardados");
      } catch (e) {
          notificar("Error al guardar", "error");
      }
  };

  const manejarCancelarCambios = () => {
      setNombreLocal(pedido.nombreCliente);
      setAnticipoLocal(pedido.anticipo.toString());
      setFechaLocal(pedido.fechaEntrega ? pedido.fechaEntrega.toDate() : new Date());
      setHoraLocal(pedido.horaEntrega);
      notificar("Cambios descartados", "info");
  };

  // lógica cambios estados
  const manejarCambioEstadoPedido = async (v: EstadoPedido) => {
      if(v === pedido.estadoPedido) return;
      await establecerEstadoPedido(pedido.id, v, pedido.estadoPago);
      notificar("Estado actualizado");
  };
  const manejarCambioEstadoPago = async (v: EstadoPago) => {
      if(v === pedido.estadoPago) return;
      await establecerEstadoPago(pedido.id, v);
      notificar("Pago actualizado");
  };

  // loogica fecha híbrida
  const formatearFecha = (d: Date|null) => d ? d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "N/A";
  
  const manejarCambioFecha = (ev:any, d?:Date) => { if(d) setFechaLocal(d); if(Platform.OS!=='ios') setMostrarPickerFecha(false); };
  const abrirPickerFecha = () => setMostrarPickerFecha(true);
  const confirmarFechaWeb = () => { /* Logica web */ setMostrarPickerFecha(false); };

  // Lógica Hora Híbrida
  const abrirPickerHora = () => {
      if (Platform.OS === 'web') {
          const [h, m_ap] = horaLocal.split(':'); 
          const [m, ap] = m_ap ? m_ap.split(' ') : ['00', 'AM'];
          setHoraModal(h||'10'); setMinutoModal(m||'00'); setAmpmModal(ap||'AM'); 
          setVisiblePickerHoraWeb(true);
      } else {
          // Lógica android
          const d = new Date();
          const [time, modifier] = horaLocal.split(' ');
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
          setHoraLocal(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`);
      }
  };

  const confirmarHoraWeb = () => {
      setHoraLocal(`${horaModal}:${minutoModal} ${ampmModal}`);
      setVisiblePickerHoraWeb(false);
  };
  // calulo de adelanto y restante
  const pagoRestante = pedido.montoTotal - parseFloat(anticipoLocal || "0");
  // --- RENDER ---
  return (
    <Contenedor>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <BotonVolver />
        <Titulo>Detalle de Pedido</Titulo>

<Tarjeta>
          {/* cliente */}
          <FilaDetalle titulo="Cliente:">
            <ContenedorInput style={{ width: 200 }}>
                <StyledTextInput 
                    value={nombreLocal} 
                    onChangeText={setNombreLocal} 
                />
            </ContenedorInput>
          </FilaDetalle>

          {/*fecha */}
          <FilaDetalle titulo="Fecha de Entrega:">
            <View style={{ width: 200 }}>
                <SelectorInput 
                    valor={formatearFecha(fechaLocal)}
                    icono="calendar"
                    onPress={abrirPickerFecha}
                />
            </View>
          </FilaDetalle>

          {/*hora*/}
          <FilaDetalle titulo="Hora de Entrega:">
            <View style={{ width: 200 }}>
                <SelectorInput 
                    valor={horaLocal}
                    icono="clock-outline"
                    onPress={abrirPickerHora}
                />
            </View>
          </FilaDetalle>

          {/*estados*/}
          <FilaDetalle titulo="Estado del Pedido:">
             <PickerContGlobal>
               <StyledPickerGlobal 
                  selectedValue={pedido.estadoPedido} 
                  onValueChange={(v) => manejarCambioEstadoPedido(v as EstadoPedido)}
               >
                  {ESTADOS_PEDIDO.map(s => <Picker.Item key={s} label={s} value={s} />)}
               </StyledPickerGlobal>
             </PickerContGlobal>
          </FilaDetalle>

          <FilaDetalle titulo="Estado del Pago:">
             <PickerContGlobal>
               <StyledPickerGlobal 
                  selectedValue={pedido.estadoPago} 
                  onValueChange={(v) => manejarCambioEstadoPago(v as EstadoPago)}
               >
                  {ESTADOS_PAGO.map(s => <Picker.Item key={s} label={s} value={s} />)}
               </StyledPickerGlobal>
             </PickerContGlobal>
          </FilaDetalle>

          {/*montos*/}
          <FilaDetalle 
             titulo="Monto Total:" 
             valor={`$${pedido.montoTotal.toFixed(2)}`} 
          />

          <FilaDetalle titulo="Anticipo:">
             <ContenedorInput style={{ width: 200 }}>
                <StyledTextInput 
                  value={anticipoLocal} 
                  onChangeText={setAnticipoLocal} 
                  keyboardType="numeric"
                />
             </ContenedorInput>
          </FilaDetalle>

          {/* resto*/}
          <FilaDetalle 
             titulo="Pago Restante:" 
             conSeparador={false}
          >
             <ValorDetalle style={{ 
                 fontWeight: 'bold', 
                 color: pagoRestante > 0 ? Colors.rojo : Colors.verde 
             }}>
                ${pagoRestante.toFixed(2)}
             </ValorDetalle>
          </FilaDetalle>

          {/*botones para cambios*/}
          {hayCambios && (
              <ContenedorAccionesEdicion>
                  <TextoInfo style={{ marginBottom: 10, textAlign: 'center' }}>
                      Tienes cambios sin guardar
                  </TextoInfo>
                  <Fila>
                      <BotonCancelar onPress={manejarCancelarCambios} style={{ flex: 1, marginRight: 10 }}>
                          <TextoBoton>Cancelar</TextoBoton>
                      </BotonCancelar>
                      <BotonGuardar onPress={manejarGuardarCambios} style={{ flex: 1, marginLeft: 10 }}>
                          <TextoBoton>Confirmar</TextoBoton>
                      </BotonGuardar>
                  </Fila>
              </ContenedorAccionesEdicion>
          )}
        </Tarjeta>

        <Fila style={{ marginTop: 20, marginBottom: 10 }}>
            <SubTitulo style={{ margin: 0 }}>Productos ({productosPedido.length}):</SubTitulo>
            <BotonCircular size={40} bgColor={Colors.verde} onPress={() => setModalAgregarVisible(true)}>
                <MaterialCommunityIcons name="plus" size={24} color="white" />
            </BotonCircular>
        </Fila>

        {cargandoProductos ? <ActivityIndicator size="large" color={Colors.naranja}/> : 
          <ContenedorTabla>
            <FilaTabla encabezado>
                <CeldaTabla ancho="45%" encabezado>
                    Producto
                </CeldaTabla>
                <CeldaTabla ancho="15%" encabezado>
                    Cant.
                </CeldaTabla>
                <CeldaTabla ancho="25%" encabezado>
                    Total
                </CeldaTabla>
                <CeldaTabla ancho="15%" encabezado>
                </CeldaTabla>
            </FilaTabla>
            {productosPedido.map(item => (
                <FilaTabla key={item.id}>
                    <CeldaTabla ancho="45%">{item.nombreProducto}</CeldaTabla>
                    <CeldaTabla ancho="15%">{item.cantidad}</CeldaTabla>
                    <CeldaTabla ancho="25%">${item.subtotal.toFixed(2)}</CeldaTabla>
                    <CeldaAccion ancho="15%">
                        <BotonCircular size={30} bgColor={Colors.fondo} onPress={() => confirmarEliminarProducto(item)}>
                            <Ionicons name="trash-outline" size={18} color={Colors.rojo} />
                        </BotonCircular>
                    </CeldaAccion>
                </FilaTabla>
            ))}
          </ContenedorTabla>
        }
      </ScrollView>

      {/*modal*/}
      
      {/* Fecha nativa */}
      {Platform.OS !== 'web' && mostrarPickerFecha && <DateTimePicker value={fechaLocal || new Date()} mode="date" display="default" onChange={manejarCambioFecha} />}
      {/* Hora Nativa (Android) */}
      {Platform.OS !== 'web' && mostrarPickerHoraNativo && <DateTimePicker value={fechaHoraNativa} mode="time" is24Hour={false} display="default" onChange={manejarCambioHoraNativo} />}

      {/* Fecha web */}
      {Platform.OS === 'web' && (
        <Modal animationType="fade" transparent visible={mostrarPickerFecha} onRequestClose={() => setMostrarPickerFecha(false)}>
          <FondoModal>
            <ContenidoModal>
              <TituloModal>Fecha</TituloModal>
              <input type="date" value={fechaTemp} onChange={(e: any) => setFechaTemp(e.target.value)} style={{ padding: 10, width: '100%' }} />
              <BotonModal onPress={confirmarFechaWeb}><TextoBoton>Confirmar</TextoBoton></BotonModal>

              <BotonModal 
                fondo={Colors.naranjaSuave} 
                onPress={() => setMostrarPickerFecha(false)} 
                style={{ marginTop: 8 }}
              >
                <TextoBoton>Cerrar</TextoBoton>
              </BotonModal>
            </ContenidoModal>
          </FondoModal>
        </Modal>
      )}

      {/* Hora web*/}
      {Platform.OS === 'web' && (
      <ModalConfirmacion
            visible={esVisiblePickerHoraWeb}
            titulo="Seleccionar Hora"
            textoConfirmar="Confirmar Hora"
            onConfirm={confirmarHoraWeb}
            onCancel={() => setVisiblePickerHoraWeb(false)}>
        <ContenedorPickerHora>
            <ColumnaPickerHora>
                <StyledPickerGlobal
                    selectedValue={horaModal}
                    onValueChange={(v) => setHoraModal(v as string)}
                >
                    {horas.map((h) => (
                        <Picker.Item key={h} label={h} value={h} />
                    ))}
                </StyledPickerGlobal>
            </ColumnaPickerHora>

            <SeparadorHora>:</SeparadorHora>

            <ColumnaPickerHora>
                <StyledPickerGlobal
                    selectedValue={minutoModal}
                    onValueChange={(v) => setMinutoModal(v as string)}
                >
                    {minutos.map((m) => (
                        <Picker.Item key={m} label={m} value={m} />
                    ))}
                </StyledPickerGlobal>
            </ColumnaPickerHora>

            <ColumnaPickerHora>
                <StyledPickerGlobal
                    selectedValue={ampmModal}
                    onValueChange={(v) => setAmpmModal(v as string)}
                >
                    {ampm.map((a) => (
                        <Picker.Item key={a} label={a} value={a} />
                    ))}
                </StyledPickerGlobal>
            </ColumnaPickerHora>
        </ContenedorPickerHora>

      </ModalConfirmacion>
      )}

      {/* Agregar Producto */}
      <ModalConfirmacion
        visible={modalAgregarVisible}
        titulo="Agregar Producto"
        textoConfirmar="Agregar"
        onConfirm={manejarAgregarProducto}
        onCancel={() => setModalAgregarVisible(false)}
      >
          <Etiqueta style={{alignSelf:'flex-start'}}>Buscar:</Etiqueta>
          <CampoTexto 
            placeholder="Nombre..." 
            value={busquedaProd} 
            onChangeText={setBusquedaProd} 
            style={{ width: '100%', marginBottom: 10 }} 
          />
          
          {productoEncontrado ? (
            <TextoInfo style={{color: Colors.verde, marginBottom: 10}}>
                Encontrado: {productoEncontrado.nombre} (${productoEncontrado.precio})
            </TextoInfo>
          ) : null}

          <Etiqueta style={{alignSelf:'flex-start'}}>Cantidad:</Etiqueta>
          <CampoTexto 
            placeholder="0" 
            keyboardType="numeric" 
            value={cantidadProd} 
            onChangeText={setCantidadProd} 
            style={{ width: '100%', marginBottom: 10 }} 
          />
      </ModalConfirmacion>
      
      <SnackBar esVisible={mostrarSnack} mensaje={mensajeSnack} tipo={tipoSnack} />
    </Contenedor>
  );
}

// estilos
const ContenedorAccionesEdicion = styled.View`
  margin-top: 20px;
  padding-top: 15px;
  border-top-width: 1px;
  border-top-color: ${Colors.borde};
`;

const Contenedor = styled(ContainerPadded)`
  padding-bottom: 0;
`;

const ContenedorInput = styled.View`
  border-width: 1px;
  border-color: ${Colors.naranja};
  border-radius: 8px;
  height: 44px;
  justify-content: center;
  padding-left: 8px;
  background-color: #ffffff;
`;

const ContenedorTabla = styled.View`
  background-color: #ffffff;
  border-radius: 10px;
  border-width: 1px;
  border-color: ${Colors.naranja};
  overflow: hidden;
`;

const FondoModal = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ContenidoModal = styled.View`
  width: 85%;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  align-items: center;
`;

const ValorDetalle = styled(TextoGlobal)`
  font-size: 16px;
`;

const Tarjeta = styled(TarjetaGlobal)`
  margin-bottom: 15px;
  border-width: 1px;
  border-color: ${Colors.naranja};
`;

const SubTitulo = styled(Titulo)`
  font-size: 22px;
`;


const FilaTabla = styled.View<{ encabezado?: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ encabezado }) => (encabezado ? '#f7f7f7' : '#ffffff')};
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const CeldaTabla = styled(TextoGlobal)<{ ancho: string; encabezado?: boolean }>`
  width: ${({ ancho }) => ancho};
  padding: 12px 8px;
  font-size: 14px;
  font-weight: ${({ encabezado }) => (encabezado ? 'bold' : 'normal')};
  text-align: ${({ ancho }) => (ancho === '30%' ? 'right' : 'left')};
  border-right-width: 1px;
  border-right-color: #e0e0e0;
`;

const CeldaAccion = styled.View<{ ancho: string }>`
  width: ${({ ancho }) => ancho};
  align-items: center;
  justify-content: center;
`;

const TituloModal = styled(Titulo)`
  font-size: 20px;
  margin-bottom: 20px;
`;

const BotonModal = styled(BotonAccion)<{ fondo?: string }>`
  background-color: ${({ fondo }) => fondo || Colors.verde};
  padding-vertical: 10px;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
`;

const ContenedorPickerHora = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 150px;
  margin-bottom: 20px;
  background-color: #f7f7f7;
  border-radius: 8px;
`;

const ColumnaPickerHora = styled.View`
  flex: 1;
  height: 100%;
  justify-content: center;
`;

const SeparadorHora = styled.Text`
  font-size: 30px;
  font-weight: bold;
  color: ${Colors.texto};
  padding-bottom: 15px;
`;
