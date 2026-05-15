/* -------- firebase-config.js (YES Connected PSHE) -------- */

// Import the modular Firebase SDKs directly from the CDN
import { initializeApp } from "[gstatic.com](https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js)";
import { getAuth } from "[gstatic.com](https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js)";
import { getFirestore } from "[gstatic.com](https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js)";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4mqTVMfzKeyJjZfstcvRVyE3oa9_CO0Y",
  authDomain: "yesconnectedpshe.firebaseapp.com",
  projectId: "yesconnectedpshe",
  storageBucket: "yesconnectedpshe.appspot.com",
  messagingSenderId: "1018281902876",
  appId: "1:1018281902876:web:f28e9d77c8a5f55aeb30d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export to use in other modules
export { app, auth, db };
