import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCaFxQgh4m9KAcvvAlAGP9Alwc3n7SsFN0",
  authDomain: "debatearena-25060.firebaseapp.com",
  projectId: "debatearena-25060",
  storageBucket: "debatearena-25060.firebasestorage.app",
  messagingSenderId: "43862600564",
  appId: "1:43862600564:web:2dc9eeaf7e7555bede9a21",
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

