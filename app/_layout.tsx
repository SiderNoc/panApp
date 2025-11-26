import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import styled from "styled-components/native";
import { ProveedorPedidos } from "../_context/OrderContext";
import { ProveedorProductos } from "../_context/ProductContext";
import { ProveedorVentas } from "../_context/SaleContext";

const ContenidoDrawer = (props: any) => {
    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
            <MenuEncabezado>
                <MaterialCommunityIcons name="menu" size={32} color="#4a4a4a" /> 
                <TituloMenu>Menú</TituloMenu>
            </MenuEncabezado>
            
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
};

export default function Layout() {
  const colorFondoHeader = '#ECCB6C'; 
  const colorTextoHeader = '#ffffffff'; 
  const colorEtiquetaDrawer = '#4a4a4a';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProveedorProductos>
        <ProveedorPedidos>
          <ProveedorVentas>
          <Drawer
            drawerContent={ContenidoDrawer}
            screenOptions={{
              headerStyle: { backgroundColor: colorFondoHeader },
              headerTintColor: colorTextoHeader,
              headerTitleStyle: { 
                fontWeight: 'bold',
                fontSize: 32,
              },
              drawerActiveTintColor: colorTextoHeader,
              drawerInactiveTintColor: colorEtiquetaDrawer,
              drawerActiveBackgroundColor: '#efa166ff',
              drawerLabelStyle: {
                fontSize: 16,
                fontWeight: '600',
              },
            }}
          >
            {/* Rutas visibles */}
            <Drawer.Screen 
                name="index" 
                options={{ 
                  drawerLabel: "Inicio",
                  title: "PanApp",
                  drawerIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="home" size={size} color={color} />
                  ),
                }} 
              />
            <Drawer.Screen 
              name="productos/index"
              options={{ 
                drawerLabel: "Productos",
                title: "PanApp",
                drawerIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="bread-slice" size={size} color={color} />
                ),
              }} 
            />

            <Drawer.Screen 
              name="pedidos/index" 
              options={{ 
                drawerLabel: "Pedidos",
                title: "PanApp",
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="receipt" size={size} color={color} />
                ),
              }} 
            />
            
            <Drawer.Screen 
              name="calculo-venta/index" 
              options={{ 
                drawerLabel: "Calcular venta",
                title: "PanApp",
                drawerIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="calculator-variant" size={size} color={color} />
                ),
              }} 
            />

            <Drawer.Screen 
              name="historial-venta/index" 
              options={{ 
                drawerLabel: "Historial de ventas", 
                title: "PanApp",
                drawerIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
                ),
              }} 
            />
            {/* Reportes Avanzados (NUEVO) */}
                <Drawer.Screen 
                  name="reportes/index" 
                  options={{ 
                    drawerLabel: "Reportes", 
                    title: "PanApp",
                    drawerIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="file-chart" size={size} color={color} />
                    ),
                  }} 
                />
            {/* Rutas ocultas */}
            <Drawer.Screen 
              name="productos/add-product" 
              options={{ drawerItemStyle: { height: 0, overflow: 'hidden' }, title: "Añadir Producto" }} 
            />
            <Drawer.Screen 
              name="productos/edit-product" 
              options={{ drawerItemStyle: { height: 0, overflow: 'hidden' }, title: "Editar Producto" }} 
            />
            <Drawer.Screen 
              name="pedidos/add-order" 
              options={{ drawerItemStyle: { height: 0, overflow: 'hidden' }, title: "Nuevo Pedido" }} 
            />
            <Drawer.Screen 
              name="pedidos/order-detail" 
              options={{ drawerItemStyle: { height: 0, overflow: 'hidden' }, title: "Detalle de Pedido" }} 
            />
          </Drawer>
          </ProveedorVentas>
        </ProveedorPedidos>
      </ProveedorProductos>
    </GestureHandlerRootView>
  );
}

const MenuEncabezado = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 20px;
    padding-top: 50px; 
    border-bottom-width: 3px;
    border-bottom-color: #eee;
    margin-bottom: 10px;
`;

const TituloMenu = styled.Text`
    font-size: 28px;
    font-weight: 800;
    color: #4a4a4a;
    margin-left: 15px;
`;