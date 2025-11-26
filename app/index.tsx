import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import styled from "styled-components/native";

// Contextos
import { usePedidos } from "../_context/OrderContext";
import { useVentas } from "../_context/SaleContext";

// SharedStyles
import {
    Colors,
    ContainerPadded,
    Etiqueta,
    Fila,
    Tarjeta,
    Texto,
    Titulo
} from "@/components/SharedStyles";

export default function Dashboard() {
  const router = useRouter();
  const { ventas } = useVentas();
  const { pedidos } = usePedidos();

  // Para el resumen del dia y pedidos pendientes de entrega hoy
  const { resumenHoy, pedidosPendientesEntregaHoy } = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día 00:00

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1); // Inicio del día siguiente 00:00

    // Calcular ventas de mostrador
    const ventasHoy = ventas.filter(v => {
        const fecha = v.fechaVenta.toDate();
        return fecha >= hoy && fecha < manana;
    });
    const totalVentas = ventasHoy.reduce((acc, v) => acc + v.montoTotal, 0);

    // calcula ingreso de pedidos tomados cada dia
    // Filtra pedidos que se CREARON hoy (fechaPedido), sin importar cuándo se entregan
    const pedidosTomadosHoy = pedidos.filter(p => {
        const fechaEncargo = p.fechaPedido.toDate();
        return fechaEncargo.toDateString() === new Date().toDateString();
    });

    const ingresoPedidos = pedidosTomadosHoy.reduce((acc, p) => {
        if (p.estadoPago === 'Reembolsado') {
            return acc + 0;
        } else if (p.estadoPago === 'Pagado') {
            // Si el pedido se tomó hoy y ya se pagó completo hoy, sumamos todo
            return acc + p.montoTotal; 
        } else {
            // Si se tomó hoy pero sigue pendiente, solo sumamos lo que dejó de anticipo hoy
            return acc + (p.anticipo || 0); 
        }
    }, 0);

    // Filtrar pedidos que se entregan hoy y aún no están entregados/cancelados
    const entregasParaHoy = pedidos.filter(p => {
        if (!p.fechaEntrega) return false;
        const fechaEnt = p.fechaEntrega.toDate();
        // Es para hoy y no está entregado/cancelado
        return (
            fechaEnt.toDateString() === new Date().toDateString() && 
            p.estadoPedido !== 'Entregado' && 
            p.estadoPedido !== 'Cancelado'
        );
    });
    
    // Ordenar por hora
    entregasParaHoy.sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));

    return {
        resumenHoy: {
            ventas: totalVentas,
            pedidos: ingresoPedidos,
            total: totalVentas + ingresoPedidos
        },
        pedidosPendientesEntregaHoy: entregasParaHoy
    };
  }, [ventas, pedidos]);

  const fechaActual = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ContainerPadded>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/*encabezado */}
        <View style={{ marginBottom: 20, marginTop: 10 }}>
            <TituloDashboard>Hola 👋</TituloDashboard>
            <TextoFecha>{fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)}</TextoFecha>
        </View>

        {/* tarjetas*/}
        <EtiquetaSeccion>Corte de Caja (Hoy)</EtiquetaSeccion>
        <Fila style={{ marginBottom: 15 }}>
            {/* Tarjeta ventas */}
            <CardResumen>
                <IconoFondo name="storefront-outline" size={40} color="rgba(233, 128, 49, 0.15)" />
                <TextoTituloCard>Mostrador</TextoTituloCard>
                <TextoMonto>${resumenHoy.ventas.toFixed(2)}</TextoMonto>
            </CardResumen>

            <View style={{width: 15}} />

            {/* Tarjeta pedidos*/}
            <CardResumen>
                <IconoFondo name="receipt-outline" size={40} color="rgba(126, 211, 33, 0.2)" />
                <TextoTituloCard>Ingreso de pedidos</TextoTituloCard>
                <TextoMonto style={{ color: Colors.verde }}>${resumenHoy.pedidos.toFixed(2)}</TextoMonto>
            </CardResumen>
        </Fila>

        {/* Tarjeta total */}
        <TarjetaTotal>
            <Fila>
                <Texto style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Dinero Recibido</Texto>
                <Texto style={{ color: 'white', fontWeight: '900', fontSize: 24 }}>${resumenHoy.total.toFixed(2)}</Texto>
            </Fila>
        </TarjetaTotal>


        {/*accesos rapidos */}
        <EtiquetaSeccion style={{ marginTop: 25 }}>Accesos Rápidos</EtiquetaSeccion>
        <Fila style={{ marginBottom: 10 }}>
            <BotonAccesoRapido onPress={() => router.push('../calculo-venta/')}>
                <CirculoIcono color="#e3f2fd">
                    <MaterialCommunityIcons name="calculator" size={28} color="#2196f3" />
                </CirculoIcono>
                <TextoAcceso>Nueva Venta</TextoAcceso>
            </BotonAccesoRapido>

            <BotonAccesoRapido onPress={() => router.push('../pedidos/add-order')}>
                <CirculoIcono color="#e8f5e9">
                    <MaterialCommunityIcons name="playlist-plus" size={28} color="#4caf50" />
                </CirculoIcono>
                <TextoAcceso>Crear Pedido</TextoAcceso>
            </BotonAccesoRapido>

            <BotonAccesoRapido onPress={() => router.push('../productos/add-product')}>
                <CirculoIcono color="#fff3e0">
                    <MaterialCommunityIcons name="bread-slice" size={28} color={Colors.naranja} />
                </CirculoIcono>
                <TextoAcceso>Nuevo Pan</TextoAcceso>
            </BotonAccesoRapido>
        </Fila>


        {/* Alertas de pedidos*/}
        <EtiquetaSeccion style={{ marginTop: 15 }}>Entregas Pendientes (Hoy)</EtiquetaSeccion>
        
        {pedidosPendientesEntregaHoy.length === 0 ? (
            <TarjetaVacia>
                <Ionicons name="checkmark-circle-outline" size={40} color={Colors.verde} />
                <Texto style={{ marginTop: 5, color: Colors.textoGris }}>¡Todo entregado por hoy!</Texto>
            </TarjetaVacia>
        ) : (
            pedidosPendientesEntregaHoy.map(p => (
                <TarjetaAlerta key={p.id} onPress={() => router.push({ pathname: "../pedidos/order-detail", params: { id: p.id } })}>
                    <BarraLateral />
                    <View style={{ flex: 1 }}>
                        <Fila>
                            <TextoCliente>{p.nombreCliente}</TextoCliente>
                            <TextoHora>{p.horaEntrega}</TextoHora>
                        </Fila>
                        <TextoDetalle>Monto: ${p.montoTotal} • {p.estadoPago}</TextoDetalle>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                </TarjetaAlerta>
            ))
        )}

      </ScrollView>
    </ContainerPadded>
  );
}

// ESTILOS

const TituloDashboard = styled(Titulo)`
    margin-bottom: 0;
    color: ${Colors.texto};
`;

const TextoFecha = styled.Text`
    font-size: 16px;
    color: ${Colors.textoGris};
    text-transform: capitalize;
`;

const EtiquetaSeccion = styled(Etiqueta)`
    font-size: 18px;
    margin-bottom: 10px;
    color: ${Colors.texto};
`;

const CardResumen = styled(Tarjeta)`
    flex: 1;
    padding: 15px;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    height: 100px;
    justify-content: center;
`;

const IconoFondo = styled(Ionicons)`
    position: absolute;
    right: -5px;
    bottom: -5px;
    transform: rotate(-15deg);
`;

const TextoTituloCard = styled.Text`
    font-size: 13px; /* Ajustado un poco para que quepa bien */
    color: ${Colors.textoGris};
    font-weight: 600;
    margin-bottom: 5px;
`;

const TextoMonto = styled.Text`
    font-size: 22px;
    font-weight: bold;
    color: ${Colors.naranja};
`;

const TarjetaTotal = styled.View`
    background-color: ${Colors.naranja};
    border-radius: 12px;
    padding: 20px;
    shadow-color: #000;
    shadow-opacity: 0.2;
    shadow-offset: 0px 4px;
    elevation: 5;
    margin-bottom: 10px;
`;

const BotonAccesoRapido = styled.TouchableOpacity`
    flex: 1;
    align-items: center;
`;

const CirculoIcono = styled.View<{ color: string }>`
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background-color: ${p => p.color};
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    border-width: 1px;
    border-color: rgba(0,0,0,0.05);
`;

const TextoAcceso = styled.Text`
    font-size: 12px;
    font-weight: 600;
    color: ${Colors.texto};
    text-align: center;
`;

const TarjetaAlerta = styled.TouchableOpacity`
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    flex-direction: row;
    align-items: center;
    border-width: 1px;
    border-color: #eee;
    overflow: hidden;
`;

const BarraLateral = styled.View`
    width: 4px;
    height: 100%;
    background-color: ${Colors.naranja};
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
`;

const TextoCliente = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: ${Colors.texto};
`;

const TextoHora = styled.Text`
    font-size: 14px;
    font-weight: bold;
    color: ${Colors.rojo};
    background-color: #ffebee;
    padding: 2px 6px;
    border-radius: 4px;
`;

const TextoDetalle = styled.Text`
    font-size: 13px;
    color: ${Colors.textoGris};
    margin-top: 2px;
`;

const TarjetaVacia = styled.View`
    padding: 30px;
    align-items: center;
    justify-content: center;
    background-color: #f0f9eb;
    border-radius: 8px;
    border-width: 1px;
    border-color: #c3e6cb;
`;