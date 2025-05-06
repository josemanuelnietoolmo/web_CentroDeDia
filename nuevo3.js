import { database, storage } from './firebase-config.js';
import { ref as dbRef, update } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const userId = localStorage.getItem('userId');

const categorias = {
  evento: 3,
  familia: 3,
  infancia: 3,
  viaje: 3,
  objeto: 4
};

// Mostrar imágenes correspondientes
window.addEventListener('DOMContentLoaded', () => {
  for (const categoria in categorias) {
    const cantidad = categorias[categoria];
    for (let i = 1; i <= cantidad; i++) {
      const path = `${userId}/${categoria}.${i}.jpg`;
      const imgEl = document.getElementById(`img_${categoria}_${i}`);
      if (imgEl) {
        const imgRef = storageRef(storage, path);
        getDownloadURL(imgRef)
          .then((url) => {
            imgEl.src = url;
          })
          .catch(() => {
            imgEl.alt = 'Imagen no disponible';
          });
      }
    }
  }
});

document.getElementById('form3').addEventListener('submit', function (e) {
  e.preventDefault();

  const updates = {};
  for (const categoria in categorias) {
    const cantidad = categorias[categoria];
    for (let i = 1; i <= cantidad; i++) {
      const input = document.getElementById(`texto_${categoria}_${i}`);
      if (input) {
        updates[`texto_${categoria}_${i}`] = input.value;
      }
    }
  }

  const userRef = dbRef(database, `CentroDeDia/usuarios/${userId}`);
  update(userRef, updates)
    .then(() => {
      alert('Usuario creado con éxito');
      localStorage.clear();
      window.location.href = 'panel.html';
    })
    .catch((error) => {
      alert('Error al guardar los textos. Intenta de nuevo.');
      console.error(error);
    });
});
