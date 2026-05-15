import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4mqTVMfzKeyJjZfstcvRVyE3oa9_CO0Y",
  authDomain: "yesconnectedpshe.firebaseapp.com",
  projectId: "yesconnectedpshe",
  storageBucket: "yesconnectedpshe.appspot.com",
  messagingSenderId: "1018281902876",
  appId: "1:1018281902876:web:f28e9d77c8a5f55aeb30d9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
