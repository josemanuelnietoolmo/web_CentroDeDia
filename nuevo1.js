import { database } from './firebase-config.js';
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// Cargar dinámicamente las limitaciones desde Firebase
const limitacionesRef = ref(database, 'CentroDeDia/limitaciones');
onValue(limitacionesRef, (snapshot) => {
  const container = document.getElementById('limitacionesContainer');
  container.innerHTML = ''; // Limpiar contenedor

  const data = snapshot.val();
  if (data) {
    Object.entries(data).forEach(([limId, limData]) => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.innerHTML = `
        <input type="checkbox" name="limitacion" value="${limId}">
        ${limData.nombreLimitacion}
      `;
      container.appendChild(label);
    });
  }
});

// Evento del formulario
document.getElementById('form1').addEventListener('submit', function(e) {
  e.preventDefault();

  const userName = document.getElementById('userName').value;
  const edad = document.getElementById('edad').value;

  if (userName && edad) {
    const userId = `user${Date.now()}`;

    // Guardar datos del usuario
    const userRef = ref(database, `CentroDeDia/usuarios/${userId}`);
    set(userRef, {
      userName: userName,
      edad: edad
    })
    .then(() => {
      // Obtener limitaciones seleccionadas
      const checkboxes = document.querySelectorAll('input[name="limitacion"]:checked');
      const limitacionesSeleccionadas = {};

      checkboxes.forEach(checkbox => {
        limitacionesSeleccionadas[checkbox.value] = true;
      });

      // Guardar limitaciones del usuario
      const limitacionesUsuarioRef = ref(database, `CentroDeDia/limitaciones-usuario/${userId}`);
      return set(limitacionesUsuarioRef, limitacionesSeleccionadas);
    })
    .then(() => {
      // Guardar datos básicos en localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('edad', edad);

      // Redirigir al paso 2
      window.location.href = 'nuevo2.html';
    })
    .catch(error => {
      alert('Ocurrió un error al guardar los datos. Intenta de nuevo.');
      console.error(error);
    });

  } else {
    alert('Por favor, rellena todos los campos.');
  }
});
