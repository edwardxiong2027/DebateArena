import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCXEtq0ubgtXIbb7s_JzoWt8daNejKwuLQ",
  authDomain: "mindmap-9f454.firebaseapp.com",
  projectId: "mindmap-9f454",
  storageBucket: "mindmap-9f454.firebasestorage.app",
  messagingSenderId: "582191293462",
  appId: "1:582191293462:web:e278d8ccbcfdb9e8538137",
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

