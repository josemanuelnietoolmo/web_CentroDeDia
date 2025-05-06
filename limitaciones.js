import { database } from './firebase-config.js';
import {ref, onValue, push, remove, set} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js';

const listaLimitaciones = document.getElementById("listaLimitaciones");
const inputLimitacion = document.getElementById("nuevaLimitacionInput");
const refLimitaciones = ref(database, 'CentroDeDia/limitaciones');

// Mostrar limitaciones en tiempo real
onValue(refLimitaciones, (snapshot) => {
  listaLimitaciones.innerHTML = "";

  snapshot.forEach(child => {
    const id = child.key;
    const nombre = child.val().nombreLimitacion;

    const li = document.createElement("li");
    li.textContent = nombre;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.style.marginLeft = "10px";
    btnEliminar.onclick = () => {
      const confirmacion = confirm(`¿Eliminar la limitación "${nombre}"?`);
      if (!confirmacion) return;
    
      // Eliminar de la tabla de limitaciones
      remove(ref(database, `CentroDeDia/limitaciones/${id}`))
        .then(() => {
          // Eliminar esa limitación en todos los usuarios
          const refLimitacionesUsuario = ref(database, 'CentroDeDia/limitaciones-usuario');
          onValue(refLimitacionesUsuario, (snapshot) => {
            snapshot.forEach(usuarioSnap => {
              const userID = usuarioSnap.key;
              const userLimitaciones = usuarioSnap.val();
    
              if (userLimitaciones && userLimitaciones[id]) {
                remove(ref(database, `CentroDeDia/limitaciones-usuario/${userID}/${id}`));
              }
            });
          }, { onlyOnce: true }); // solo una vez
        })
        .catch((err) => {
          console.error("Error al eliminar limitación:", err);
        });
    };
    

    li.appendChild(btnEliminar);
    listaLimitaciones.appendChild(li);
  });
});

window.agregarLimitacion = () => {
  const input = document.getElementById("nuevaLimitacionInput");
  const nombreLimitacion = input.value.trim();

  if (!nombreLimitacion) {
    alert("Por favor, escribe una limitación.");
    return;
  }

  const nuevaRef = push(ref(database, 'CentroDeDia/limitaciones'));
  set(nuevaRef, { nombreLimitacion })
    .then(() => {
      input.value = "";
    })
    .catch((err) => {
      console.error("Error al agregar limitación:", err);
    });
};

