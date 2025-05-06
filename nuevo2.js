import { storage } from './firebase-config.js';
import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const userId = localStorage.getItem("userId");

document.getElementById("form2").addEventListener("submit", async (e) => {
  e.preventDefault();

  const filesToUpload = [
    { inputId: "familia1", path: `${userId}/familia.1.jpg` },
    { inputId: "familia2", path: `${userId}/familia.2.jpg` },
    { inputId: "familia3", path: `${userId}/familia.3.jpg` },

    { inputId: "infancia1", path: `${userId}/infancia.1.jpg` },
    { inputId: "infancia2", path: `${userId}/infancia.2.jpg` },
    { inputId: "infancia3", path: `${userId}/infancia.3.jpg` },

    { inputId: "evento1", path: `${userId}/evento.1.jpg` },
    { inputId: "evento2", path: `${userId}/evento.2.jpg` },
    { inputId: "evento3", path: `${userId}/evento.3.jpg` },

    { inputId: "viaje1", path: `${userId}/viaje.1.jpg` },
    { inputId: "viaje2", path: `${userId}/viaje.2.jpg` },
    { inputId: "viaje3", path: `${userId}/viaje.3.jpg` },

    { inputId: "objeto1", path: `${userId}/objeto.1.jpg` },
    { inputId: "objeto2", path: `${userId}/objeto.2.jpg` },
    { inputId: "objeto3", path: `${userId}/objeto.3.jpg` },
    { inputId: "objeto4", path: `${userId}/objeto.4.jpg` },
    
    { inputId: "musica1", path: `${userId}/musica1.mp3` },
    { inputId: "musica2", path: `${userId}/musica2.mp3` },
    { inputId: "musica3", path: `${userId}/musica3.mp3` }
  ];

  for (const fileObj of filesToUpload) {
    const input = document.getElementById(fileObj.inputId);
    if (input && input.files.length > 0) {
      const file = input.files[0];
      const storageRef = ref(storage, fileObj.path);
      await uploadBytes(storageRef, file);
    }
  }
 
  window.location.href = "nuevo3.html";
});
