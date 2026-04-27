import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithCredential,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { firebaseConfig } from './firebase.config';

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((err: unknown) =>
    console.warn("Firebase persistence:", err)
  );
} catch (error) {
  console.warn("Firebase initialization failed:", error);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Messaging
let messaging: Messaging | null = null;
try {
  if (app) {
    messaging = getMessaging(app);
  }
} catch { }

export const signInWithGoogleCredential = async (idToken: string) => {
  if (!auth) {
    return {
      success: true,
      user: null,
      warning: "Firebase not configured",
    };
  }
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return {
      success: true,
      user: result.user,
      additionalUserInfo: getAdditionalUserInfo(result),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Firebase sign-in failed";
    console.error("Firebase Google sign-in error:", error);
    return { success: false, error: message };
  }
};

export {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  messaging,
  getToken,
  onMessage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
};
export type { User };
