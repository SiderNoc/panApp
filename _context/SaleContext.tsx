import {
    Timestamp,
    collection,
    doc,
    limit,
    onSnapshot,
    query,
    setDoc,
    where
} from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { db } from '../_utils/firebaseConfig';

// tipos de datos
type Venta = {
    id: string;
    fechaVenta: Timestamp;
    cantidadTotal: number;
    montoTotal: number;
};

type DatosNuevaVenta = {
    listaProductos: { 
        id: string; 
        cantidad: number; 
        precio: number; 
        subtotal: number;
        nombre: string;
    }[];
    cantidadTotal: number;
    montoTotal: number;
};

type TipoFiltro = 'hoy' | 'semanal' | 'mensual';

type TipoContextoVenta = {
    ventas: Venta[];
    filtroActivo: TipoFiltro;
    establecerFiltro: (filtro: TipoFiltro) => void;
    cargando: boolean;
    registrarVenta: (datos: DatosNuevaVenta) => Promise<void>; 
};

const ContextoVenta = createContext<TipoContextoVenta | null>(null);

export const useVentas = () => useContext(ContextoVenta)!;

// Función para obtener el rango de fechas según el filtro
const obtenerRangoFechas = (filtro: TipoFiltro): { inicio: Timestamp, fin: Timestamp } => {
    const ahora = new Date();
    const fin = Timestamp.fromDate(ahora); 
    let inicio: Date;

    switch (filtro) {
        case 'hoy':
            inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
            break;
        case 'semanal':
            inicio = new Date();
            inicio.setDate(ahora.getDate() - 7);
            inicio.setHours(0, 0, 0, 0);
            break;
        case 'mensual':
            inicio = new Date();
            inicio.setDate(ahora.getDate() - 30);
            inicio.setHours(0, 0, 0, 0);
            break;
        default:
            inicio = new Date(0); 
    }

    return { inicio: Timestamp.fromDate(inicio), fin };
};

export const ProveedorVentas = ({ children }: { children: React.ReactNode }) => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [filtroActivo, setFiltroActivo] = useState<TipoFiltro>('hoy');
    const [cargando, setCargando] = useState(true);

    const establecerFiltro = useCallback((filtro: TipoFiltro) => {
        setFiltroActivo(filtro);
    }, []);

    // Escuchar cambios en ventas según el filtro activo
    useEffect(() => {
        setCargando(true);
        const { inicio, fin } = obtenerRangoFechas(filtroActivo);
        
        // CAMBIO: Colección 'ventas'
        const refColeccion = collection(db, 'ventas');

        // CAMBIO: Campo 'fechaVenta'
        const q = query(
            refColeccion,
            where('fechaVenta', '>=', inicio),
            where('fechaVenta', '<=', fin),
            limit(100)
        );

        const desuscribir = onSnapshot(q, (snapshot) => {
            const ventasCargadas: Venta[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Venta));

            setVentas(ventasCargadas);
            setCargando(false);
            console.log(`[Firestore] ${ventasCargadas.length} ventas cargadas (Filtro: ${filtroActivo}).`);
        }, (error) => {
            console.error("[Firestore] Error al escuchar ventas:", error);
            setCargando(false);
        });

        return () => desuscribir();
    }, [filtroActivo]);


    const registrarVenta = async (datos: DatosNuevaVenta): Promise<void> => {
        if (datos.montoTotal <= 0 || datos.listaProductos.length === 0) {
            console.error("Venta inválida.");
            throw new Error("Venta inválida.");
        }
        
        try {
            const refNuevaVenta = doc(collection(db, 'ventas'));
            const datosVenta = {
                fechaVenta: Timestamp.now(), 
                cantidadTotal: datos.cantidadTotal,
                montoTotal: datos.montoTotal,
            };
            
            await setDoc(refNuevaVenta, datosVenta);
            console.log("Venta registrada:", refNuevaVenta.id);

        } catch (e) {
            console.error("Error al registrar venta:", e);
            throw e;
        }
    };

    return (
        <ContextoVenta.Provider 
            value={{ ventas, filtroActivo, establecerFiltro, cargando, registrarVenta }} 
        >
            {children}
        </ContextoVenta.Provider>
    );
};