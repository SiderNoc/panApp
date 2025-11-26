
import Constants from 'expo-constants';
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'; // <-- Importaciones Clave

const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,

  measurementId: extra.firebaseMeasurementId 
};

if (!firebaseConfig.projectId) {
    const msg = "❌ Error Crítico: No se encontró el PROJECT_ID de Firebase.";
    console.error(msg);
    console.error("Asegúrate de:");
    console.error("1. Tener el archivo .env en la raíz del proyecto.");
    console.error("2. Haber reiniciado el servidor con limpieza de caché (npx expo start -c).");
    throw new Error(msg);
}

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  })
});


export { db };

