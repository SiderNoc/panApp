import 'dotenv/config';

export default {
  "expo": {
    "name": "panapp",
    "slug": "panapp",
    "version": "1.1.1",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "panapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      package: "com.sider.panapp"
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },

    // ⭐️ AGREGAR ESTO
    updates: {
      url: "https://u.expo.dev/bcd997e9-1c7d-40c6-8428-4bc4b7f19e0f",
      enabled: true,
      checkAutomatically: "ON_LOAD",
    },
    runtimeVersion: {
      policy: "appVersion",
    },

    // ⭐️ FIN DE LO NUEVO

        // 🔐 AQUÍ ESTÁ LA CLAVE: Variables de Entorno expuestas a la App
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    "eas": {
        "projectId": "bcd997e9-1c7d-40c6-8428-4bc4b7f19e0f"
      }
    }
  }
}
