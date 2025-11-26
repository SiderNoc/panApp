# 🍞 PanApp - Sistema de Gestión para Panadería

Una aplicación móvil desarrollada con **React Native (Expo)** y **Firebase** diseñada para administrar las operaciones diarias de una panadería. Permite gestionar productos, registrar pedidos con anticipos, realizar ventas de mostrador y generar reportes financieros en Excel.

## 📱 Características Principales

* **Dashboard Interactivo:** Resumen en tiempo real de ventas del día, abonos recibidos y alertas de pedidos pendientes de entrega.
* **Gestión de Pedidos:**
    * Registro de encargos con fecha y hora de entrega.
    * Control de estados: *En proceso, Entregado, Cancelado*.
    * Control de pagos: *Pendiente (con anticipo), Pagado, Reembolsado*.
    * Edición de pedidos y cálculo automático de saldos.
* **Punto de Venta (Venta Rápida):** Calculadora integrada para registrar ventas de mostrador rápidamente seleccionando productos del catálogo.
* **Catálogo de Productos:** CRUD completo (Crear, Leer, Actualizar, Eliminar) de productos con precios y categorías.
* **Historial y Reportes:**
    * Historial unificado de Ventas y Pedidos.
    * Filtros por periodo (Día, Semana, Mes) y tipo de ingreso.
    * **Exportación a Excel:** Generación y descarga de reportes `.xlsx` directamente desde la app.

## 🛠️ Tecnologías Utilizadas

* **Framework:** [React Native](https://reactnative.dev/) con [Expo SDK](https://expo.dev/).
* **Lenguaje:** TypeScript / JavaScript.
* **Base de Datos:** Firebase Firestore (NoSQL).
* **Navegación:** Expo Router & React Navigation (Drawer).
* **Estilos:** Styled Components.
* **Actualizaciones:** EXPO/EAS

## 📦 Dependencias Clave

Estas son las librerías principales necesarias para ejecutar el proyecto:

* `expo` & `react-native`
* `firebase`: Conexión a la base de datos en la nube.
* `styled-components`: Para el diseño de componentes visuales.
* `expo-router`: Manejo de navegación basado en archivos.
* `@react-navigation/drawer`: Menú lateral principal.
* `@react-native-picker/picker`: Selectores de opciones.
* `@react-native-community/datetimepicker`: Selectores de fecha y hora nativos.
* **Reportes:**
    * `xlsx`: Generación de hojas de cálculo.
    * `expo-file-system`: Manejo de archivos locales.
    * `expo-sharing`: Para compartir/guardar el archivo generado.

## 🚀 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Prerrequisitos
Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (LTS recomendado).
* Git.
* La aplicación **Expo Go** en tu celular (Android/iOS) o un emulador configurado.

### 2. Clonar y preparar
```bash
# Clonar el repositorio
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)

# Entrar a la carpeta
cd TU_REPOSITORIO

# Instalar dependencias
npx expo install firebase styled-components expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants @react-navigation/drawer react-native-gesture-handler react-native-reanimated @react-native-picker/picker @react-native-community/datetimepicker xlsx expo-file-system expo-sharing
```