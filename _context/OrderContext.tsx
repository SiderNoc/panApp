import {
    collection,
    doc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../_utils/firebaseConfig';
import { useProductos } from './ProductContext';

// tipos de datos
type EstadoPedido = 'En proceso' | 'Entregado' | 'Cancelado'; 
type EstadoPago = 'Pendiente' | 'Pagado' | 'Reembolsado';

export type ProductoPedido = {
    id?: string; // id del documento en Firestore para el detalle
    idProducto: string; 
    nombreProducto: string; 
    cantidad: number; 
    subtotal: number; 
};
// estructura del pedido
export interface Pedido {
    id: string; 
    nombreCliente: string; 
    estadoPedido: EstadoPedido; 
    estadoPago: EstadoPago; 
    fechaPedido: Timestamp; 
    fechaEntrega: Timestamp | null; 
    fechaLiquidacion?: Timestamp | null; 
    horaEntrega: string; 
    anticipo: number; 
    montoTotal: number; 
}
// datos para nuevo pedido
type DatosNuevoPedido = {
    nombreCliente: string; 
    fechaEntregaStr: string;
    horaEntrega: string;
    anticipoStr: string;
    listaProductos: { id: string; cantidad: number }[];
};
// contexto del pedido
type TipoContextoPedido = {
    pedidos: Pedido[];
    agregarPedido: (datos: DatosNuevoPedido) => Promise<void>;
    obtenerProductosPedido: (idPedido: string) => Promise<ProductoPedido[]>;
    establecerEstadoPedido: (id: string, nuevoEstado: EstadoPedido, estadoPagoActual: EstadoPago) => Promise<void>;
    establecerEstadoPago: (id: string, nuevoEstadoPago: EstadoPago) => Promise<void>;
    actualizarCampoPedido: (id: string, campo: string, valor: any) => Promise<void>; 
    agregarItemPedido: (idPedido: string, item: ProductoPedido) => Promise<void>;
    eliminarItemPedido: (idPedido: string, idItem: string, subtotal: number) => Promise<void>;
};

const ContextoPedido = createContext<TipoContextoPedido | null>(null);

export const usePedidos = () => useContext(ContextoPedido)!;

// funciones auxiliares
const parsearFecha = (fechaStr: string): Timestamp | null => {
    if (!fechaStr || fechaStr.length !== 10) return null; 
    const partes = fechaStr.split('/');
    if (partes.length !== 3) return null;
    const [dia, mes, anio] = partes.map(Number);
    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null; 
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getMonth() + 1 !== mes || fecha.getFullYear() !== anio) return null;
    return Timestamp.fromDate(fecha);
};

// proveedor del contexto de pedidos
export const ProveedorPedidos = ({ children }: { children: React.ReactNode }) => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const { productos } = useProductos(); 


    useEffect(() => {
        const refColeccion = collection(db, 'pedidos');
        const q = query(refColeccion, orderBy('fechaPedido', 'desc'), limit(50));

        const desuscribir = onSnapshot(q, (snapshot) => {
            const pedidosCargados: Pedido[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Pedido));
            setPedidos(pedidosCargados);
        }, (error) => console.error("Error pedidos:", error));

        return () => desuscribir();
    }, []); 

    // obtener productos de un pedido
    const obtenerProductosPedido = async (idPedido: string): Promise<ProductoPedido[]> => {
        try {
            const refColeccionItems = collection(db, 'pedidos', idPedido, 'detalles');
            const snapshot = await getDocs(refColeccionItems);
            return snapshot.docs.map(doc => ({
                id: doc.id, 
                ...doc.data()
            } as ProductoPedido));
        } catch (e) {
            console.error("Error detalles:", e);
            return [];
        }
    };

    // agregar nuevo pedido
    const agregarPedido = async (datos: DatosNuevoPedido): Promise<void> => {
        if (!datos.nombreCliente || !datos.listaProductos.length) return;

        const timestampEntrega = parsearFecha(datos.fechaEntregaStr);
        const valorAnticipo = parseFloat(datos.anticipoStr) || 0;
        let montoTotal = 0;
        const mapaProductos = new Map(productos.map(p => [p.id, p]));
        
        const lote = writeBatch(db);
        const refNuevoPedido = doc(collection(db, 'pedidos'));
        const datosProductosPedido: ProductoPedido[] = [];

        datos.listaProductos.forEach(item => {
            const infoProducto = mapaProductos.get(item.id);
            if (infoProducto) {
                const precio = parseFloat(infoProducto.precio);
                const subtotal = precio * item.cantidad;
                montoTotal += subtotal;
                datosProductosPedido.push({
                    idProducto: item.id,
                    nombreProducto: infoProducto.nombre, 
                    cantidad: item.cantidad,
                    subtotal: subtotal,
                });
            }
        });
        
        // Determinamos estado inicial
        const esPagadoInicialmente = (montoTotal - valorAnticipo) <= 0;

        const datosPedido: Omit<Pedido, 'id'> = {
            nombreCliente: datos.nombreCliente,
            estadoPedido: 'En proceso', 
            estadoPago: esPagadoInicialmente ? 'Pagado' : 'Pendiente',
            fechaPedido: Timestamp.now(), 
            fechaEntrega: timestampEntrega,
            // CAMBIO: Si se paga todo al inicio, la fecha de liquidación es hoy. Si no, es null.
            fechaLiquidacion: esPagadoInicialmente ? Timestamp.now() : null,
            horaEntrega: datos.horaEntrega,
            anticipo: valorAnticipo,
            montoTotal: montoTotal,
        };

        lote.set(refNuevoPedido, datosPedido);
        datosProductosPedido.forEach(item => {
            const refItem = doc(collection(refNuevoPedido, 'detalles')); 
            lote.set(refItem, item);
        });

        await lote.commit();
    };

    const actualizarCamposInterno = async (id: string, campos: { [key: string]: any }): Promise<void> => {
        // Lógica automática de fechaLiquidacion
        if (campos.estadoPago === 'Pagado') {
            campos.fechaLiquidacion = Timestamp.now(); // Guardamos CUANDO se pagó
        } else if (campos.estadoPago === 'Pendiente') {
            campos.fechaLiquidacion = null; // Borramos si regresa a pendiente
        }

        const refDoc = doc(db, 'pedidos', id);
        await updateDoc(refDoc, campos);
    };
    
    // establecer estado del pedido
    const establecerEstadoPedido = async (id: string, nuevoEstado: EstadoPedido, estadoPagoActual: EstadoPago) => {
        let actPago: EstadoPago | undefined = undefined;
        if (nuevoEstado === 'Entregado') actPago = 'Pagado';
        else if (nuevoEstado === 'Cancelado' && estadoPagoActual === 'Pagado') actPago = 'Reembolsado';

        const campos: any = { estadoPedido: nuevoEstado };
        if (actPago) campos.estadoPago = actPago;
        await actualizarCamposInterno(id, campos);
    };
    
    const establecerEstadoPago = async (id: string, nuevoEstadoPago: EstadoPago) => {
        await actualizarCamposInterno(id, { estadoPago: nuevoEstadoPago });
    };

    // actualizar campo específico del pedido
    const actualizarCampoPedido = async (id: string, campo: string, valor: any) => {
        const pedidoActual = pedidos.find(p => p.id === id);
        if (!pedidoActual) return;
        
        let campos: any = {};

        switch (campo) {
            case 'nombreCliente':
            case 'horaEntrega':
                campos[campo] = valor;
                break;
            case 'anticipo':
                const valAnticipo = parseFloat(valor) || 0;
                const restante = pedidoActual.montoTotal - valAnticipo;
                let nuevoEstadoPago = pedidoActual.estadoPago;
                
                if (restante <= 0) {
                    nuevoEstadoPago = 'Pagado';
                } else if (restante > 0 && pedidoActual.estadoPago === 'Pagado') {
                    nuevoEstadoPago = 'Pendiente';
                }
                
                campos = { anticipo: valAnticipo, estadoPago: nuevoEstadoPago };
                break;
            case 'fechaEntrega':
                const ts = parsearFecha(valor);
                if (ts) campos.fechaEntrega = ts;
                else Alert.alert("Error", "Fecha inválida");
                break;
        }
        await actualizarCamposInterno(id, campos);
    };

    // agregar ITEM a pedido
    const agregarItemPedido = async (idPedido: string, item: ProductoPedido): Promise<void> => {
        try {
            const batch = writeBatch(db);
            
            const refColeccionDetalles = collection(db, 'pedidos', idPedido, 'detalles');
            const refNuevoItem = doc(refColeccionDetalles); 
            batch.set(refNuevoItem, item);

            const refPedido = doc(db, 'pedidos', idPedido);
            batch.update(refPedido, {
                montoTotal: increment(item.subtotal),
                estadoPago: 'Pendiente',
                fechaLiquidacion: null
            });

            await batch.commit();
        } catch (e) {
            console.error("Error al agregar item:", e);
            throw e;
        }
    };

    // eliminar ITEM de pedido
    const eliminarItemPedido = async (idPedido: string, idItem: string, subtotal: number): Promise<void> => {
        try {
            const batch = writeBatch(db);

            const refItem = doc(db, 'pedidos', idPedido, 'detalles', idItem);
            batch.delete(refItem);

            const refPedido = doc(db, 'pedidos', idPedido);
            batch.update(refPedido, {
                montoTotal: increment(-subtotal)
                // Nota: No marcamos como 'Pagado' automáticamente por seguridad, el usuario debe verificar
            });

            await batch.commit();
        } catch (e) {
            console.error("Error al eliminar item:", e);
            throw e;
        }
    };
    
    return (
        <ContextoPedido.Provider value={{ 
            pedidos, 
            agregarPedido, 
            obtenerProductosPedido, 
            establecerEstadoPedido, 
            establecerEstadoPago,
            actualizarCampoPedido,
            agregarItemPedido,
            eliminarItemPedido
        }}>
            {children}
        </ContextoPedido.Provider>
    );
};