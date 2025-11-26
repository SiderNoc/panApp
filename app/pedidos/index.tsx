import { Colors, ContainerPadded, ContenedorBotonFijo, Titulo } from "@/components/SharedStyles";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View } from "react-native";
import styled from "styled-components/native";
import { usePedidos } from "../../_context/OrderContext";
// punto de quiebre para tablet
const { width } = Dimensions.get('window');
const PUNTO_QUIEBRE_TABLET = 600;
const esTablet = width >= PUNTO_QUIEBRE_TABLET;
const TAMANO_BOTON = esTablet ? 120 : 80;
const TAMANO_ICONO = esTablet ? 60 : 40;

type OpcionFiltro = 'Todos' | 'En proceso' | 'Entregado' | 'Cancelado';
// Opciones de filtro disponibles
const OPCIONES_FILTRO: OpcionFiltro[] = [
    'Todos',
    'En proceso',
    'Entregado',
    'Cancelado',
];

export default function InicioPedidos() {
  const { pedidos } = usePedidos();
  const router = useRouter();

  const [filtroActivo, setFiltroActivo] = useState<OpcionFiltro>('En proceso');

  const pedidosFiltrados = useMemo(() => {
    if (filtroActivo === 'Todos') return pedidos;
    return pedidos.filter((pedido) => pedido.estadoPedido === filtroActivo);
  }, [pedidos, filtroActivo]);

  const formatearFecha = (timestamp: Timestamp | null) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const fecha = timestamp.toDate();
    return fecha.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const EncabezadoLista = () => (
    <ContenedorHeader>
      <TituloPedidos>Pedidos</TituloPedidos>

      <ContenedorFiltro>
        <EtiquetaFiltro>Filtrar por estado:</EtiquetaFiltro>
        <PickerEstilizado
          selectedValue={filtroActivo}
          onValueChange={(itemValue) => setFiltroActivo(itemValue as OpcionFiltro)}
        >
          {OPCIONES_FILTRO.map((filtro) => (
            <Picker.Item key={filtro} label={filtro} value={filtro} />
          ))}
        </PickerEstilizado>
      </ContenedorFiltro>
    </ContenedorHeader>
  );

  return (
    <ContainerPadded style={{ paddingHorizontal: 0, paddingBottom: 0 }}>
      <ContenedorLista>
        {pedidos.length === 0 ? (
            <VistaCargando>
            <ActivityIndicator size="large" color={Colors.naranja} />
            <TextoInfo>Cargando pedidos...</TextoInfo>
            </VistaCargando>
        ) : (
            <FlatList
            data={pedidosFiltrados}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={EncabezadoLista}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
            renderItem={({ item }) => (
                <TarjetaPedido
                onPress={() => router.push(`../pedidos/order-detail?id=${item.id}`)}
                >
                <Contenido>
                    <Cliente>Cliente: {item.nombreCliente}</Cliente>
                    <Entrega>
                    Entrega: {formatearFecha(item.fechaEntrega)} ({item.horaEntrega})
                    </Entrega>
                    <View style={{ position: "absolute", top: 10, right: 0 }}>
                    <MasAcciones>...</MasAcciones>
                    </View>
                </Contenido>

                <Estado>
                    <TextoEstado>*Pedido {item.estadoPedido}</TextoEstado>
                </Estado>
                </TarjetaPedido>
            )}
            ListEmptyComponent={() => (
                <TextoInfo style={{ textAlign: "center", marginTop: 20 }}>
                No hay pedidos `{filtroActivo}`.
                </TextoInfo>
            )}
            />
        )}
      </ContenedorLista>

      {/* Contenedor fijo*/}
      <ContenedorBotonFijo>
        <BotonAgregar onPress={() => router.push("../pedidos/add-order")}>
            <MaterialCommunityIcons name="plus-thick" size={TAMANO_ICONO} color="#ffffff" />
        </BotonAgregar>
      </ContenedorBotonFijo>

    </ContainerPadded>
  );
}

// estilos

const ContenedorLista = styled.View`
  flex: 1;
`;

const TituloPedidos = styled(Titulo)`
  margin-bottom: 10px;
`;

const ContenedorHeader = styled.View`
  padding-bottom: 10px;
  padding-top: 5px;
`;

const TextoInfo = styled.Text`
  font-size: 16px;
  color: ${Colors.textoGris};
  margin-top: 10px;
`;

const ContenedorFiltro = styled.View`
  margin-bottom: 15px;
  border-width: 1px;
  border-color: ${Colors.borde};
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  height: 60px;
  flex-direction: row;
  align-items: center;
`;

const EtiquetaFiltro = styled.Text`
  font-size: 14px;
  color: ${Colors.texto};
  padding-left: 10px;
  font-weight: bold;
`;

const PickerEstilizado = styled(Picker)`
  flex: 1;
  height: 100%;
  color: ${Colors.texto};
`;

const TarjetaPedido = styled.TouchableOpacity`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
  border-left-width: 5px;
  border-left-color: ${Colors.naranja};
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-offset: 0px 2px;
  elevation: 3;
`;

const Contenido = styled.View`
  margin-bottom: 5px;
  position: relative;
`;

const Cliente = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${Colors.texto};
  margin-bottom: 3px;
`;

const Entrega = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
`;

const Estado = styled.View``;

const TextoEstado = styled.Text`
  font-size: 14px;
  color: ${Colors.naranja};
  font-weight: 600;
`;

const MasAcciones = styled.Text`
  font-size: 20px;
  color: ${Colors.textoGris};
`;

const VistaCargando = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: 50px;
`;


const BotonAgregar = styled.TouchableOpacity`
  background-color: ${Colors.naranja};
  width: ${TAMANO_BOTON}px;
  height: ${TAMANO_BOTON}px;
  border-radius: ${TAMANO_BOTON / 2}px;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
  elevation: 5;
`;