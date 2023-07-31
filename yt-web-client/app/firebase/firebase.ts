// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    User, 
    Auth} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTyv-4MDfGTTtrJQ3ZojH_l5YrMx_-Qe0",
  authDomain: "clone-a764f.firebaseapp.com",
  projectId: "clone-a764f",
  appId: "1:298267718331:web:a2ecd2c8c8d2e359c0af9e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth: Auth = getAuth(app)

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentials
 */
export function signInWithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * It signs the user out.
 * @returns A promise that resolves when the user is signed out
 */
export function signOut(){
    return auth.signOut();
}   

/**
 * Trigger a callback when user auth state changes.
 * @returns A functino to unsubscripbe callback.
 */
export function onAuthStateChangedHelper(callback: (user:User | null) => void) {
    return onAuthStateChanged(auth, callback);
}