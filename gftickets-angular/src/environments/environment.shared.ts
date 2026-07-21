interface ImportMetaEnvLike {
  readonly VITE_API_URL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

const readEnvValue = (value: string | undefined, fallback: string): string =>
  value?.trim() ? value : fallback;

export const createEnvironment = (production: boolean, env: ImportMetaEnvLike = import.meta.env) => ({
  production,
  apiBaseUrl: readEnvValue(env.VITE_API_URL, 'http://teacherbanking.us-east-1.elasticbeanstalk.com'),
  firebase: {
    apiKey: readEnvValue(env.VITE_FIREBASE_API_KEY, 'AIzaSyBiloROUr-JBmU_nzT-jC1KWDSdxVYOdr8'),
    authDomain: readEnvValue(env.VITE_FIREBASE_AUTH_DOMAIN, 'gfticket-eventos.firebaseapp.com'),
    projectId: readEnvValue(env.VITE_FIREBASE_PROJECT_ID, 'gfticket-eventos'),
    storageBucket: readEnvValue(env.VITE_FIREBASE_STORAGE_BUCKET, 'gfticket-eventos.firebasestorage.app'),
    messagingSenderId: readEnvValue(env.VITE_FIREBASE_MESSAGING_SENDER_ID, '953017116777'),
    appId: readEnvValue(env.VITE_FIREBASE_APP_ID, '1:953017116777:web:d1835245bd7b0005651af8'),
  },
});
