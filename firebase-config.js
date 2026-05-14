/* -------- firebase-config.js (YES Connected PSHE) -------- */

/* Load Firebase core and services */
const firebaseConfig = {
  apiKey: "AIzaSyA4mqTVMfzKeyJjZfstcvRVyE3oa9_CO0Y",
  authDomain: "yesconnectedpshe.firebaseapp.com",
  projectId: "yesconnectedpshe",
  storageBucket: "yesconnectedpshe.firebasestorage.app",
  messagingSenderId: "1018281902876",
  appId: "1:1018281902876:web:f28e9d77c8a5f55aeb30d9"
};

/* Initialise Firebase in the browser */
firebase.initializeApp(firebaseConfig);

/* Make auth and database references available */
const auth = firebase.auth();
const db   = firebase.firestore();
