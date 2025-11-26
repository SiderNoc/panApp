import { BotonDescarga } from "@/components/BotonDescarga";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import {
    BotonToggle,
    Colors,
    ContainerPadded,
    Etiqueta,
    PickerContainer,
    StyledPicker,
    Tarjeta,
    TextoToggle,
    Titulo
} from "@/components/SharedStyles";

import { generarExcelAvanzado, obtenerDatosReporte } from '../../_utils/reportService';
// tipo de reporte: todo, ventas, pedidos
type TipoReporte = 'todo' | 'ventas' | 'pedidos';
type Periodo = 'dia' | 'semana' | 'mes';
// componente principal
export default function ReportesAvanzados() {
    const [cargando, setCargando] = useState(false);
    const [tipoReporte, setTipoReporte] = useState<TipoReporte>('todo');
    const [periodo, setPeriodo] = useState<Periodo>('dia');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [mostrarPicker, setMostrarPicker] = useState(false);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());

    const ANIO_LANZAMIENTO = 2024; 
    const anioActual = new Date().getFullYear();
    const anios = Array.from({ length: anioActual - ANIO_LANZAMIENTO + 1 }, (_, i) => anioActual - i);
    
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const calcularRango = () => {
        const inicio = new Date();
        const fin = new Date();
        if (periodo === 'dia') {
            inicio.setTime(fechaSeleccionada.getTime()); fin.setTime(fechaSeleccionada.getTime());
        } else if (periodo === 'semana') {
            const diaSemana = fechaSeleccionada.getDay();
            const diffLunes = fechaSeleccionada.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
            inicio.setDate(diffLunes); fin.setDate(diffLunes + 6);
        } else if (periodo === 'mes') {
            inicio.setFullYear(anioSeleccionado, mesSeleccionado, 1);
            fin.setFullYear(anioSeleccionado, mesSeleccionado + 1, 0);
        }
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
    };

    const manejarDescarga = async () => {
        setCargando(true);
        try {
            const { inicio, fin } = calcularRango();
            const datos = await obtenerDatosReporte(inicio, fin, tipoReporte);
            if (datos.length === 0) {
                Alert.alert("Aviso", "No se encontraron movimientos en las fechas seleccionadas.");
                setCargando(false);
                return;
            }
            const fechaStr = inicio.toLocaleDateString('es-MX').replace(/\//g, '-');
            const nombreArchivo = `Reporte_${tipoReporte.toUpperCase()}_${periodo.toUpperCase()}_${fechaStr}`;
            await generarExcelAvanzado(datos, nombreArchivo);
        } catch (error) {
            Alert.alert("Error", "Ocurrió un problema al generar el reporte.");
        } finally {
            setCargando(false);
        }
    };

    const onFechaChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS !== 'ios') setMostrarPicker(false);
        if (selectedDate) setFechaSeleccionada(selectedDate);
    };

    return (
        <ContainerPadded>
            <Titulo>Reportes</Titulo>
            <ScrollView>
                <Tarjeta style={{ marginBottom: 20 }}>
                    <Etiqueta style={{ marginBottom: 10 }}>1. ¿Qué deseas exportar?</Etiqueta>
                    <PickerContainer>
                        <StyledPicker selectedValue={tipoReporte} onValueChange={(v) => setTipoReporte(v as TipoReporte)}>
                            <Picker.Item label="Todo (Ventas + Pedidos)" value="todo" />
                            <Picker.Item label="Solo Ventas de Mostrador" value="ventas" />
                            <Picker.Item label="Solo Pedidos" value="pedidos" />
                        </StyledPicker>
                    </PickerContainer>
                </Tarjeta>

                <Tarjeta style={{ marginBottom: 20 }}>
                    <Etiqueta style={{ marginBottom: 10 }}>2. Selecciona el periodo</Etiqueta>
                    
                    {/* USANDO SHARED STYLES UNIFICADOS */}
                    <View style={{ flexDirection: 'row', marginBottom: 15, justifyContent:'space-between' }}>
                        <BotonToggle activo={periodo === 'dia'} onPress={() => setPeriodo('dia')}><TextoToggle activo={periodo === 'dia'}>Día</TextoToggle></BotonToggle>
                        <BotonToggle activo={periodo === 'semana'} onPress={() => setPeriodo('semana')}><TextoToggle activo={periodo === 'semana'}>Semana</TextoToggle></BotonToggle>
                        <BotonToggle activo={periodo === 'mes'} onPress={() => setPeriodo('mes')}><TextoToggle activo={periodo === 'mes'}>Mes</TextoToggle></BotonToggle>
                    </View>

                    {(periodo === 'dia' || periodo === 'semana') && (
                        <View>
                            <Etiqueta style={{ fontSize: 14, marginBottom: 5, color: '#666' }}>
                                {periodo === 'dia' ? "Selecciona el día:" : "Selecciona cualquier día de la semana:"}
                            </Etiqueta>
                            <BotonFecha onPress={() => setMostrarPicker(true)}>
                                <MaterialCommunityIcons name="calendar" size={24} color={Colors.naranja} />
                                <TextoFecha>{fechaSeleccionada.toLocaleDateString('es-MX')}</TextoFecha>
                            </BotonFecha>
                            {Platform.OS !== 'web' && mostrarPicker && (
                                <DateTimePicker value={fechaSeleccionada} mode="date" display="default" onChange={onFechaChange} />
                            )}
                        </View>
                    )}

                    {periodo === 'mes' && (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <View style={{ width: '55%' }}>
                            <Etiqueta style={{ fontSize: 14 }}>Mes</Etiqueta>

                            <PickerContainer>
                                <StyledPicker
                                    selectedValue={mesSeleccionado}
                                    onValueChange={(v) => setMesSeleccionado(Number(v))}
                                >
                                    {meses.map((m, i) => (
                                        <Picker.Item key={i} label={m} value={i} />
                                    ))}
                                </StyledPicker>
                            </PickerContainer>
                        </View>

                        <View style={{ width: '40%' }}>
                            <Etiqueta style={{ fontSize: 14 }}>Año</Etiqueta>

                            <PickerContainer>
                                <StyledPicker
                                    selectedValue={anioSeleccionado}
                                    onValueChange={(v) => setAnioSeleccionado(Number(v))}
                                >
                                    {anios.map((a) => (
                                        <Picker.Item key={a} label={String(a)} value={a} />
                                    ))}
                                </StyledPicker>
                            </PickerContainer>
                        </View>
                    </View>
                    )}
                </Tarjeta>

<BotonDescarga 
    onPress={manejarDescarga} 
    cargando={cargando} 
    estilo={{ marginTop: 20, width: '100%', paddingVertical: 12 }} 
/>
            </ScrollView>
        </ContainerPadded>
    );
}

// estilos
const BotonFecha = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    background-color: #fff;
    border-width: 1px;
    border-color: ${Colors.naranja};
    padding: 12px;
    border-radius: 8px;
`;

const TextoFecha = styled.Text`
    font-size: 16px;
    margin-left: 10px;
    color: ${Colors.texto};
`;