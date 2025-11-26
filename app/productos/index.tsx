import {
  BotonAccion,
  BotonCircular,
  Colors,
  Container,
  ContenedorBotonFijo,
  Titulo
} from "@/components/SharedStyles";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Alert, Dimensions, FlatList, View } from "react-native";
import styled from "styled-components/native";
import { useProductos } from "../../_context/ProductContext";

const { width } = Dimensions.get('window');
const PUNTO_QUIEBRE_TABLET = 600; 
const esTablet = width >= PUNTO_QUIEBRE_TABLET;
// Ajusta los tamaños según si es tablet o no
const TAMANO_BOTON = esTablet ? 120 : 80; 
const TAMANO_ICONO = esTablet ? 60 : 40;

const EncabezadoLista = () => (
  <ContenedorHeader>
    <Titulo>Productos</Titulo>
  </ContenedorHeader>
);

const EncabezadoTabla = () => (
  <FilaHeaderTabla>
    <CeldaHeaderTabla width="55%">
      <TextoHeaderTabla>Producto</TextoHeaderTabla>
    </CeldaHeaderTabla>
    <CeldaHeaderTabla width="25%">
      <TextoHeaderTabla>Precio</TextoHeaderTabla>
    </CeldaHeaderTabla>
    <CeldaHeaderTabla width="20%" /> 
  </FilaHeaderTabla>
);

export default function InicioProductos() {
  const { productos, eliminarProducto } = useProductos();
  const router = useRouter();

  return (
    <Container>
      <ContenedorLista>
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
              <View>
                  <EncabezadoLista />
                  <EncabezadoTabla />
              </View>
          } 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} 
          renderItem={({ item }) => (
            <FilaTabla>
              <CeldaContenido width="55%">
                <Producto>{item.nombre}:</Producto>
              </CeldaContenido>
              
              <CeldaContenido width="25%">
                <Precio>${item.precio}</Precio>
              </CeldaContenido>
              
              <Acciones width="20%">
                <BotonAccion 
                  onPress={() => router.push(`../productos/edit-product?id=${item.id}`)}
                >
                  <MaterialIcons name='mode-edit' size={24} color={"#c9df3bff"}/>
                </BotonAccion>
                
                <BotonAccion
                  onPress={() =>
                    Alert.alert(
                      "Eliminar producto",
                      "¿Seguro que deseas eliminar este producto?",
                      [
                        { text: "Cancelar" },
                        { text: "Eliminar", onPress: () => eliminarProducto(item.id) },
                      ]
                    )
                  }
                >
                  <MaterialCommunityIcons name='trash-can-outline' size={24} color={"#7b7d7dff"}/>
                </BotonAccion>
              </Acciones>
            </FilaTabla>
          )}
        />
      </ContenedorLista>
      <ContenedorBotonFijo>
        <BotonAgregar onPress={() => router.push("../productos/add-product")}>
          <MaterialCommunityIcons name='plus-thick' size={TAMANO_ICONO} color={"#ffffffff"}/>
        </BotonAgregar>
      </ContenedorBotonFijo>

    </Container>
  );
}

// estilos

const ContenedorLista = styled.View`
  flex: 1; /* Esto asegura que la lista tome el espacio restante */
`;

const ContenedorHeader = styled.View`
  padding-bottom: 10px;
  padding-top: 5px;
`;

const FilaHeaderTabla = styled.View`
  flex-direction: row;
  border-bottom-width: 2px;
  border-bottom-color: ${Colors.naranja};
  padding-bottom: 5px;
  margin-bottom: 10px;
`;

const CeldaHeaderTabla = styled.View<{ width: string }>`
  width: ${(props) => props.width};
  justify-content: flex-start;
`;

const TextoHeaderTabla = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${Colors.texto};
`;

const FilaTabla = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const CeldaContenido = styled.View<{ width: string }>`
  width: ${(props) => props.width};
  flex-direction: row;
  align-items: center;
`;

const Producto = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
  font-weight: 400;
  margin-right: 5px;
`;

const Precio = styled.Text`
  font-size: 16px;
  color: ${Colors.texto};
  font-weight: 600;
`;

const Acciones = styled.View<{ width: string }>`
  width: ${(props) => props.width};
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const BotonAgregar = styled(BotonCircular)`
  background-color: ${Colors.naranja};
  width: ${TAMANO_BOTON}px;
  height: ${TAMANO_BOTON}px;
  border-radius: ${TAMANO_BOTON / 2}px;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
  elevation: 5;
`;