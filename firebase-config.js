import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // 🔹 AÑADIDO

const firebaseConfig = {
  apiKey: "AIzaSyAccIlLgw-cvmyPH1U4n6ilBb5eNDOiK1M",
  authDomain: "fir-testing-80801.firebaseapp.com",
  databaseURL: "https://fir-testing-80801-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fir-testing-80801",
  storageBucket: "fir-testing-80801.firebasestorage.app",
  messagingSenderId: "325123946094",
  appId: "1:325123946094:web:91797dc851797d2de7587f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const firestore = getFirestore(app); // 🔹 AÑADIDO

export { app, auth, database, storage, firestore }; // 🔹 AÑADIDO firestore
