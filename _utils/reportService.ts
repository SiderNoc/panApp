import * as Sharing from 'expo-sharing';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { Alert, Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { db } from './firebaseConfig';

// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';

export type FilaReporte = {
    id: string;
    fecha: string;
    timestamp: number;
    origen: 'VENTA' | 'PEDIDO';
    descripcion: string;
    monto: number;
};

//  funciones para reporte avanzado

// funion para obtener datos de reporte
export const obtenerDatosReporte = async (inicio: Date, fin: Date, tipo: 'todo' | 'ventas' | 'pedidos') => {
    const tsInicio = Timestamp.fromDate(inicio);
    const tsFin = Timestamp.fromDate(fin);
    
    let resultados: FilaReporte[] = [];

    try {
        // consultar VENTAS
        if (tipo === 'todo' || tipo === 'ventas') {
            const qVentas = query(
                collection(db, 'ventas'),
                where('fechaVenta', '>=', tsInicio),
                where('fechaVenta', '<=', tsFin)
            );
            const snapshotVentas = await getDocs(qVentas);
            snapshotVentas.forEach(doc => {
                const d = doc.data();
                const fechaObj = d.fechaVenta.toDate();
                resultados.push({
                    id: doc.id,
                    fecha: fechaObj.toLocaleDateString('es-MX'),
                    timestamp: fechaObj.getTime(),
                    origen: 'VENTA',
                    descripcion: 'Venta Rápida',
                    monto: d.montoTotal
                });
            });
        }

        //consultar PEDIDOS
        if (tipo === 'todo' || tipo === 'pedidos') {
            const qPedidos = query(
                collection(db, 'pedidos'),
                where('fechaPedido', '>=', tsInicio),
                where('fechaPedido', '<=', tsFin)
            );
            const snapshotPedidos = await getDocs(qPedidos);
            snapshotPedidos.forEach(doc => {
                const d = doc.data();
                const fechaObj = d.fechaPedido.toDate();
                resultados.push({
                    id: doc.id,
                    fecha: fechaObj.toLocaleDateString('es-MX'),
                    timestamp: fechaObj.getTime(),
                    origen: 'PEDIDO',
                    descripcion: `Cliente: ${d.nombreCliente}`,
                    monto: d.montoTotal
                });
            });
        }

        resultados.sort((a, b) => b.timestamp - a.timestamp);
        return resultados;

    } catch (error) {
        console.error("Error al obtener reporte:", error);
        throw error;
    }
};

// crear y compartir excel
export const generarExcelAvanzado = async (datos: FilaReporte[], nombreArchivo: string) => {
    if (datos.length === 0) {
        Alert.alert("Sin datos", "No se encontraron registros en este rango.");
        return;
    }

    const total = datos.reduce((sum, item) => sum + item.monto, 0);

    const datosExcel = datos.map(item => ({
        ID: item.id.substring(0, 6),
        Fecha: item.fecha,
        Origen: item.origen,
        Descripción: item.descripcion,
        Monto: item.monto
    }));

    datosExcel.push({ ID: '', Fecha: '', Origen: '', Descripción: 'TOTAL GRAL.', Monto: total });

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    if (Platform.OS === "web") {
        XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    } else {

        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

        const uri = FileSystem.documentDirectory + `${nombreArchivo}.xlsx`;
        
        await FileSystem.writeAsStringAsync(uri, wbout, { encoding: 'base64' });
        
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        } else {
            Alert.alert("Éxito", "Reporte guardado.");
        }
    }
};