import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../_utils/firebaseConfig';

// estructura del producto
type Producto = {
  id: string;
  nombre: string;
  precio: string;
  tipo: string;
};
//contexto del producto
type TipoContextoProducto = {
  productos: Producto[];
  agregarProducto: (nombre: string, tipo: string, precio: string) => Promise<void>;
  actualizarProducto: (id: string, nombre: string, tipo: string, precio: string) => Promise<void>;
  eliminarProducto: (id: string) => Promise<void>;
  obtenerProductoPorId: (id: string) => Producto | undefined;
};

const ContextoProducto = createContext<TipoContextoProducto | null>(null);

export const useProductos = () => useContext(ContextoProducto)!;

export const ProveedorProductos = ({ children }: { children: React.ReactNode }) => {
  const [productos, setProductos] = useState<Producto[]>([]);

  // escuchar cambios en la colección de productos
  useEffect(() => {
    const refColeccion = collection(db, 'productos');

    const desuscribir = onSnapshot(refColeccion, (snapshot) => {
      const productosCargados: Producto[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Producto)); 

      setProductos(productosCargados);
      console.log(`[Firestore] ${productosCargados.length} productos cargados.`);
    }, (error) => {
      console.error("[Firestore] Error al escuchar productos:", error);
    });

    return () => desuscribir();
  }, []);

  // CRUD

  const agregarProducto = async (nombre: string, tipo: string, precio: string): Promise<void> => {
    try {
      const nuevoDocRef = doc(collection(db, 'productos')); 
      await setDoc(nuevoDocRef, { nombre, tipo, precio });
    } catch (e) {
      console.error("Error al añadir producto: ", e);
      throw e; 
    }
  };

  const actualizarProducto = async (id: string, nombre: string, tipo: string, precio: string): Promise<void> => {
    try {
      const docRef = doc(db, 'productos', id);
      await setDoc(docRef, { nombre, tipo, precio }, { merge: true });
    } catch (e) {
      console.error("Error al actualizar producto: ", e);
      throw e; 
    }
  };

  const eliminarProducto = async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, 'productos', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Error al eliminar producto: ", e);
      throw e;
    }
  };

  const obtenerProductoPorId = (id: string): Producto | undefined => productos.find(p => p.id === id);

  return (
    <ContextoProducto.Provider value={{ productos, 
                                        agregarProducto, 
                                        actualizarProducto, 
                                        eliminarProducto, 
                                        obtenerProductoPorId }}>
      {children}
    </ContextoProducto.Provider>
  );
};