import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB1HurHxjrelkpGf0uV6DVPiJV-MinkGS8",
  authDomain: "proofvault-a11d3.firebaseapp.com",
  databaseURL: "https://proofvault-a11d3-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "proofvault-a11d3",
  appId: "1:92526077521:web:0dbee5535af36a870f7a70",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

