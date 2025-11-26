/* eslint-disable import/no-named-as-default */
import * as Sharing from 'expo-sharing';
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, ScrollView, View } from "react-native";
import styled from "styled-components/native";
import * as XLSX from 'xlsx';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';

import {
    BotonToggle,
    Colors,
    ContainerPadded,
    ContenedorFiltros,
    TablaCelda,
    TablaContenedor,
    TablaFila,
    TablaTexto,
    TextoCargando,
    TextoToggle,
    TextoVacio,
    Titulo,
    VistaCargando
} from "@/components/SharedStyles";

import { BotonDescarga } from "@/components/BotonDescarga";
import { ModalConfirmacion } from "@/components/ModalConfirmacion";

import { usePedidos } from "../../_context/OrderContext";
import { useVentas } from "../../_context/SaleContext";
// tipos de fuente para los filtros
type TipoFuente = 'todo' | 'ventas' | 'pedidos';

// Componente principal
export default function HistorialVentas() {
  const { ventas, filtroActivo, establecerFiltro, cargando: cargandoVentas } = useVentas();
  const { pedidos } = usePedidos();

  const [filtroFuente, setFiltroFuente] = useState<TipoFuente>('todo');
  const [modalVisible, setModalVisible] = useState(false);

  const formatearFecha = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const fecha = timestamp.toDate();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  // lógica para combinar y filtrar datos
  const { cantidadTotal, montoTotal, datosCombinados } = useMemo(() => {
    const ahora = new Date();
    const inicio = new Date();
    ahora.setHours(23, 59, 59, 999);
    
    if (filtroActivo === 'hoy') { inicio.setHours(0, 0, 0, 0); } 
    else if (filtroActivo === 'semanal') { inicio.setDate(ahora.getDate() - 7); inicio.setHours(0, 0, 0, 0); } 
    else if (filtroActivo === 'mensual') { inicio.setDate(ahora.getDate() - 30); inicio.setHours(0, 0, 0, 0); }

    // ventas rápidas
    const listaVentas = ventas.map(v => ({
        id: v.id,
        tipoOriginal: 'venta',
        fechaObj: v.fechaVenta.toDate(),
        fechaTexto: formatearFecha(v.fechaVenta),
        cantidad: v.cantidadTotal,
        monto: v.montoTotal,
        etiqueta: 'Venta Rápida',
        color: Colors.verde
    }));

    // pedidos
    const listaMovimientosPedidos: any[] = [];

    pedidos.forEach(p => {
        const fechaCreacion = p.fechaPedido.toDate();
        
        // anticoipo ( Si tiene anticipo y está en rango)
        if (p.anticipo > 0 && fechaCreacion >= inicio && fechaCreacion <= ahora) {
            listaMovimientosPedidos.push({
                id: p.id + "_ant",
                tipoOriginal: 'pedido',
                fechaObj: fechaCreacion,
                fechaTexto: formatearFecha(p.fechaPedido),
                cantidad: 1,
                monto: p.anticipo,
                etiqueta: `Anticipo: ${p.nombreCliente}`,
                color: Colors.naranja
            });
        }

        // liquidación ( Si está pagado y tiene fecha de liquidación)
        if (p.estadoPago === 'Pagado' && p.fechaLiquidacion) {
            const fechaLiq = p.fechaLiquidacion.toDate();
            const montoRestante = p.montoTotal - p.anticipo;

            if (montoRestante > 0 && fechaLiq >= inicio && fechaLiq <= ahora) {
                listaMovimientosPedidos.push({
                    id: p.id + "_liq",
                    tipoOriginal: 'pedido',
                    fechaObj: fechaLiq,
                    fechaTexto: formatearFecha(p.fechaLiquidacion),
                    cantidad: 0, 
                    monto: montoRestante,
                    etiqueta: `Liquidación: ${p.nombreCliente}`,
                    color: Colors.verde
                });
            }
        }
    });

    // filtrar por fecha
    let datosFinales = [];
    if (filtroFuente === 'ventas') datosFinales = listaVentas;
    else if (filtroFuente === 'pedidos') datosFinales = listaMovimientosPedidos;
    else datosFinales = [...listaVentas, ...listaMovimientosPedidos];

    // Ordenar descendente
    datosFinales.sort((a, b) => b.fechaObj.getTime() - a.fechaObj.getTime());

    const totalCant = datosFinales.reduce((sum, item) => sum + item.cantidad, 0);
    const totalDinero = datosFinales.reduce((sum, item) => sum + item.monto, 0);

    return { cantidadTotal: totalCant, montoTotal: totalDinero.toFixed(2), datosCombinados: datosFinales };
  }, [ventas, pedidos, filtroActivo, filtroFuente]);

  const prepararDescarga = () => {
      if (datosCombinados.length === 0) {
          Alert.alert("Sin datos", "No hay información para exportar.");
          return;
      }
      setModalVisible(true);
  };

  const generarReporteExcel = async () => {
    setModalVisible(false);
    try {
        const datosExcel = datosCombinados.map(item => ({
            ID: item.id.split('_')[0].substring(0, 6), // Limpiar ID visual
            Fecha: item.fechaTexto,
            Origen: item.tipoOriginal.toUpperCase(),
            Concepto: item.etiqueta, // Usamos el concepto descriptivo
            Monto: item.monto
        }));
        datosExcel.push({ ID: 'TOTAL', Fecha: '', Origen: '', Concepto: '', Monto: parseFloat(montoTotal) });

        const ws = XLSX.utils.json_to_sheet(datosExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Ventas");
        const nombreArchivo = `Reporte_${filtroActivo}_${filtroFuente}.xlsx`;
        // Guardar o compartir el archivo
        if (Platform.OS === "web") {
            XLSX.writeFile(wb, nombreArchivo);
        } else {
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const uri = FileSystem.documentDirectory + nombreArchivo;
            
            await FileSystem.writeAsStringAsync(uri, wbout, { encoding: 'base64' });
            
            if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
            else Alert.alert("Éxito", "Reporte guardado.");
        }
    } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "No se pudo generar el reporte.");
    }
  };

  const renderizarFila = ({ item, esEncabezado = false }: { item: any, esEncabezado?: boolean }) => (
    <TablaFila esEncabezado={esEncabezado}>

      <TablaCelda width="40%">
        {esEncabezado ? <TablaTexto esEncabezado>Concepto / ID</TablaTexto> : (
            <View style={{alignItems: 'flex-start', paddingLeft: 5}}>
                <TextoTipo color={item.color}>{item.etiqueta}</TextoTipo>
                <TextoID>#{item.id.split('_')[0].substring(0, 4)}</TextoID>
            </View>
        )}
      </TablaCelda>
      <TablaCelda width="25%">
          <TablaTexto esEncabezado={esEncabezado}>
              {esEncabezado ? "Fecha" : item.fechaTexto}
          </TablaTexto>
      </TablaCelda>

      <TablaCelda width="35%">
          <TablaTexto
              esEncabezado={esEncabezado}
              align="right"
              style={{ paddingRight: 10 }}
          >
              {esEncabezado ? "Monto" : `$${item.monto.toFixed(2)}`}
          </TablaTexto>
      </TablaCelda>
    </TablaFila>
  );

  return (
    <ContainerPadded>
      <ContenedorEncabezado>
        <EncabezadoTituloRow>
            <TituloHistorial>Historial</TituloHistorial>
            <BotonDescarga onPress={prepararDescarga} texto="Exportar" />
        </EncabezadoTituloRow>

        {/* Filtros de tiempo */}
        <ContenedorFiltros>
            <BotonToggle
                activo={filtroActivo === "hoy"}
                onPress={() => establecerFiltro("hoy")}
            >
                <TextoToggle activo={filtroActivo === "hoy"}>
                    Hoy
                </TextoToggle>
            </BotonToggle>

            <BotonToggle
                activo={filtroActivo === "semanal"}
                onPress={() => establecerFiltro("semanal")}
            >
                <TextoToggle activo={filtroActivo === "semanal"}>
                    Semanal
                </TextoToggle>
            </BotonToggle>

            <BotonToggle
                activo={filtroActivo === "mensual"}
                onPress={() => establecerFiltro("mensual")}
            >
                <TextoToggle activo={filtroActivo === "mensual"}>
                    Mensual
                </TextoToggle>
            </BotonToggle>
        </ContenedorFiltros>


        {/* Filtros de Fuente */}
        <ContenedorFiltrosFuente>
            <EtiquetaFuente>Ver:</EtiquetaFuente>

            <BotonFuente
                activo={filtroFuente === 'todo'}
                onPress={() => setFiltroFuente('todo')}
            >
                <TextoFuente activo={filtroFuente === 'todo'}>
                    Todo
                </TextoFuente>
            </BotonFuente>

            <BotonFuente
                activo={filtroFuente === 'ventas'}
                onPress={() => setFiltroFuente('ventas')}
            >
                <TextoFuente activo={filtroFuente === 'ventas'}>
                    Ventas
                </TextoFuente>
            </BotonFuente>

            <BotonFuente
                activo={filtroFuente === 'pedidos'}
                onPress={() => setFiltroFuente('pedidos')}
            >
                <TextoFuente activo={filtroFuente === 'pedidos'}>
                    Pedidos
                </TextoFuente>
            </BotonFuente>
        </ContenedorFiltrosFuente>
      </ContenedorEncabezado>

      <ContenedorTituloTabla>
        <SubTituloTabla>Registros: {datosCombinados.length}</SubTituloTabla>
      </ContenedorTituloTabla>

      <TablaContenedor>
        {cargandoVentas ? (
          <VistaCargando>
            <ActivityIndicator size="large" color={Colors.primary} />
            <TextoCargando>Cargando...</TextoCargando>
          </VistaCargando>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            {datosCombinados.length > 0 && renderizarFila({ item: {}, esEncabezado: true })}
            <FlatList
              data={datosCombinados}
              keyExtractor={(item) => item.tipoOriginal + item.id}
              renderItem={({ item }) => renderizarFila({ item })}
              scrollEnabled={false}
              ListEmptyComponent={() => <TextoVacio>No hay movimientos registrados.</TextoVacio>}
            />
          </ScrollView>
        )}
      </TablaContenedor>

      <ContenedorPie>
        <TextoResumen>Total Transacciones: {datosCombinados.length}</TextoResumen>
        <TotalResumen>Total Dinero: ${montoTotal}</TotalResumen>
      </ContenedorPie>

      <ModalConfirmacion
        visible={modalVisible}
        titulo="Confirmar Reporte"
        textoConfirmar="Descargar Excel"
        onConfirm={generarReporteExcel}
        onCancel={() => setModalVisible(false)}
      >
        <View style={{ width: '100%' }}>
            <FilaDetalleModal>
                <EtiquetaModal>Periodo:</EtiquetaModal>
                <ValorModal>{filtroActivo.toUpperCase()}</ValorModal>
            </FilaDetalleModal>
            <SeparadorModal />
            
            <FilaDetalleModal>
                <EtiquetaModal>Fuente:</EtiquetaModal>
                <ValorModal>{filtroFuente === 'todo' ? 'Todo' : filtroFuente.toUpperCase()}</ValorModal>
            </FilaDetalleModal>
            <SeparadorModal />

            <FilaDetalleModal>
                <EtiquetaModal>Total:</EtiquetaModal>
                <ValorModal style={{color: Colors.verde, fontWeight: 'bold'}}>${montoTotal}</ValorModal>
            </FilaDetalleModal>
        </View>
      </ModalConfirmacion>
    </ContainerPadded>
  );
}

// estilos
const ContenedorEncabezado = styled.View`
    padding: 10px 0;
`;

const EncabezadoTituloRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
`;

const TituloHistorial = styled(Titulo)`
    margin-bottom: 0;
`;

const ContenedorFiltrosFuente = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
    background-color: #eee;
    padding: 4px;
    border-radius: 8px;
`;

const EtiquetaFuente = styled.Text`
    font-size: 14px;
    color: #666;
    margin-left: 8px;
    margin-right: 10px;
    font-weight: bold;
`;

const BotonFuente = styled.TouchableOpacity<{ activo: boolean }>`
    flex: 1;
    background-color: ${(p) => (p.activo ? '#fff' : 'transparent')};
    padding: 6px 0;
    border-radius: 6px;
    align-items: center;
    shadow-opacity: ${(p) => (p.activo ? 0.1 : 0)};
    elevation: ${(p) => (p.activo ? 1 : 0)};
`;

const TextoFuente = styled.Text<{ activo: boolean }>`
    color: ${(p) => (p.activo ? Colors.primary : '#666')};
    font-size: 13px;
    font-weight: ${(p) => (p.activo ? 'bold' : 'normal')};
`;

const ContenedorTituloTabla = styled.View`
    padding: 0 0 10px 0;
`;

const SubTituloTabla = styled.Text`
    font-size: 14px;
    color: #9b9b9b;
    text-align: center;
`;

const TextoTipo = styled.Text<{ color?: string }>`
    font-size: 12px;
    font-weight: bold;
    color: ${(p) => p.color || Colors.texto};
`;

const TextoID = styled.Text`
    font-size: 10px;
    color: #999;
`;

const ContenedorPie = styled.View`
    padding: 15px 0;
    background-color: #fff;
    border-top-width: 1px;
    border-top-color: #e0e0e0;
`;

const TextoResumen = styled.Text`
    font-size: 16px;
    color: #4a4a4a;
    margin-bottom: 5px;
`;

const TotalResumen = styled(TextoResumen)`
    font-weight: bold;
    font-size: 20px;
    color: ${Colors.naranja};
`;

const FilaDetalleModal = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 5px;
`;

const SeparadorModal = styled.View`
    height: 1px;
    background-color: #eee;
    margin: 5px 0 10px 0;
`;

const EtiquetaModal = styled.Text`
    font-size: 16px;
    color: #666;
`;

const ValorModal = styled.Text`
    font-size: 16px;
    color: #333;
    font-weight: bold;
`;
