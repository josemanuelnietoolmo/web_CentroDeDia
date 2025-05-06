import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById("loginBtn");
  const errorElem = document.getElementById("error");

  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "panel.html";
      })
      .catch((error) => {
        errorElem.textContent = "Error al iniciar sesión. Verifica tus datos.";
        console.error(error);
      });
  });
});
