import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCa0Vk6BUvjVbJJc5mTM5YFljUqo6FT_xg",
  authDomain: "podchat---real-time-chatting.firebaseapp.com",
  projectId: "podchat---real-time-chatting",
  storageBucket: "podchat---real-time-chatting.firebasestorage.app",
  messagingSenderId: "274085251389",
  appId: "1:274085251389:web:8f1d84ad5196d466721d54",
  measurementId: "G-4PWT5QFSJC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const provider = new GoogleAuthProvider();
