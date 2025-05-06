// editar.js
import { getStorage, ref as storageRef, listAll, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { database } from './firebase-config.js';
import { ref as dbRef, get, update, set, remove } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js';

document.addEventListener("DOMContentLoaded", async () => {
  const storage = getStorage();
  const urlParams = new URLSearchParams(window.location.search);
  const uid = urlParams.get("uid");
  const imagenesPreview = document.getElementById("imagenesPreview");
  const musicaPreview = document.getElementById("musicaPreview");
  const estado = document.getElementById("estado");

  if (!uid) {
    estado.textContent = "ID de usuario no especificado";
    return;
  }

  const carpetaRef = storageRef(storage, uid);
  const archivos = await listAll(carpetaRef);

  const categorias = {
    familia: [], infancia: [], viaje: [], evento: [], objeto: []
  };

  // Mostrar hasta 3 campos de audio
  const audios = archivos.items
    .filter(item => item.name.toLowerCase().endsWith(".mp3"))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (let i = 0; i < 3; i++) {
    const fila = document.createElement("div");
    fila.className = "bloque-edicion fila-audio";

    const label = document.createElement("label");
    label.textContent = `Audio ${i + 1}:`;
    fila.appendChild(label);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/mpeg";

    if (audios[i]) {
      const url = await getDownloadURL(audios[i]);

      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = url;
      audio.style.marginLeft = "10px";
      fila.appendChild(audio);

      input.addEventListener("change", (e) => {
        const nuevo = e.target.files[0];
        if (!nuevo) return;
        const refAudio = storageRef(storage, audios[i].fullPath);

        guardarTextosTemporalmente();
        uploadBytesResumable(refAudio, nuevo).then(() => {
          getDownloadURL(refAudio).then((newURL) => {
            audio.src = newURL;
            audio.load(); // Recargar el nuevo archivo
          });
        });
      });

      fila.appendChild(input);
    } else {
      input.addEventListener("change", (e) => {
        const nuevo = e.target.files[0];
        if (!nuevo) return;
        const nombre = `musica${i + 1}.mp3`;
        const nuevaRuta = `${uid}/${nombre}`;
        const nuevaRef = storageRef(storage, nuevaRuta);

        guardarTextosTemporalmente();
        uploadBytesResumable(nuevaRef, nuevo).then(() => {
          getDownloadURL(nuevaRef).then((newURL) => {
            const nuevoAudio = document.createElement("audio");
            nuevoAudio.controls = true;
            nuevoAudio.src = newURL;
            nuevoAudio.style.marginLeft = "10px";
            input.insertAdjacentElement("beforebegin", nuevoAudio);
          });
        });
        
      });

      fila.appendChild(input);
    }

    musicaPreview.appendChild(fila);
  }

  for (const item of archivos.items) {
    const nombre = item.name.toLowerCase();
    const url = await getDownloadURL(item);

    if (nombre.includes("familia")) categorias.familia.push({ url, path: item.fullPath });
    else if (nombre.includes("infancia")) categorias.infancia.push({ url, path: item.fullPath });
    else if (nombre.includes("viaje")) categorias.viaje.push({ url, path: item.fullPath });
    else if (nombre.includes("evento")) categorias.evento.push({ url, path: item.fullPath });
    else if (nombre.includes("objeto")) categorias.objeto.push({ url, path: item.fullPath });
  }
  

  const cantidades = {
    familia: 3,
    infancia: 3,
    viaje: 3,
    evento: 3,
    objeto: 4
  };

 // ...existing code...

for (const categoria in cantidades) {
  const titulo = document.createElement("h3");
  titulo.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
  imagenesPreview.appendChild(titulo);

  for (let i = 0; i < cantidades[categoria]; i++) {
    const fila = document.createElement("div");
    fila.className = "bloque-edicion fila-imagen";

    const inputTexto = document.createElement("input");
    inputTexto.type = "text";
    inputTexto.placeholder = `Texto ${categoria} ${i + 1}`;
    inputTexto.id = `texto_${categoria}_${i + 1}`;
    inputTexto.className = "texto-input";

    // Restaurar texto temporal si existe y guardar en tiempo real
    inputTexto.value = sessionStorage.getItem(inputTexto.id) || "";
    inputTexto.addEventListener("input", () => {
      sessionStorage.setItem(inputTexto.id, inputTexto.value);
    });

    const img = document.createElement("img");
    img.className = "imagen-preview";
    img.alt = "Sin imagen";
    img.style.opacity = 0.3;

    const nombreArchivo = `${categoria}.${i + 1}.jpg`;
    const ruta = `${uid}/${nombreArchivo}`;
    const refNueva = storageRef(storage, ruta);

    // Verificar si la imagen existe
    try {
      const url = await getDownloadURL(refNueva);
      img.src = url;
      img.style.opacity = 1; // Imagen encontrada, restaurar opacidad
    } catch (error) {
      console.warn(`Imagen no encontrada: ${nombreArchivo}`);
    }

    const cambiar = document.createElement("input");
    cambiar.type = "file";
    cambiar.accept = "image/*";

    cambiar.addEventListener("change", (e) => {
      const archivoNuevo = e.target.files[0];
      if (!archivoNuevo) return;

      guardarTextosTemporalmente();
      uploadBytesResumable(refNueva, archivoNuevo).then(() => {
        getDownloadURL(refNueva).then((newURL) => {
          img.src = newURL;
          img.style.opacity = 1; // Imagen cargada, restaurar opacidad
        });
      });
    });

    fila.appendChild(inputTexto);
    fila.appendChild(img);
    fila.appendChild(cambiar);
    imagenesPreview.appendChild(fila);
  }
}

// ...existing code...


  // 1. Obtener limitaciones disponibles
  const listaLimitacionesDiv = document.getElementById("listaLimitaciones");
  const limitacionesRef = dbRef(database, "CentroDeDia/limitaciones");
  const limitacionesUsuarioRef = dbRef(database, `CentroDeDia/limitaciones-usuario/${uid}`);

  const [limSnap, limUserSnap] = await Promise.all([get(limitacionesRef), get(limitacionesUsuarioRef)]);

  const limitaciones = limSnap.exists() ? limSnap.val() : {};
  const activas = limUserSnap.exists() ? limUserSnap.val() : {};

  for (const id in limitaciones) {
    const nombre = limitaciones[id].nombreLimitacion || id;
  
    const label = document.createElement("label");
    label.style.display = "block";
  
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = id;
    checkbox.checked = activas.hasOwnProperty(id);
    checkbox.className = "checkbox-limitacion";
  
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + nombre));
    listaLimitacionesDiv.appendChild(label);
  }
  

  // Cargar datos desde Firebase
  const campos = [
    "userName", "edad",
    "texto_evento_1", "texto_evento_2", "texto_evento_3",
    "texto_familia_1", "texto_familia_2", "texto_familia_3",
    "texto_infancia_1", "texto_infancia_2", "texto_infancia_3",
    "texto_objeto_1", "texto_objeto_2", "texto_objeto_3", "texto_objeto_4",
    "texto_viaje_1", "texto_viaje_2", "texto_viaje_3"
  ];

  const userRef = dbRef(database, `CentroDeDia/usuarios/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    estado.textContent = "Usuario no encontrado";
    return;
  }

  const datos = snapshot.val();
  campos.forEach(campo => {
    const input = document.getElementById(campo);
    if (input && datos[campo] !== undefined) {
      input.value = datos[campo];
    }
  });

  // Guardar cambios
  document.getElementById("editarForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevosDatos = {};
    campos.forEach(campo => {
      const input = document.getElementById(campo);
      nuevosDatos[campo] = input ? input.value : "";
    });

    await update(userRef, nuevosDatos);
    // Obtener checkboxes seleccionados
    const seleccionadas = Array.from(document.querySelectorAll(".checkbox-limitacion"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

    // Eliminar todas las limitaciones anteriores
    await remove(limitacionesUsuarioRef);

    // Añadir las nuevas
    for (const id of seleccionadas) {
    await set(dbRef(database, `CentroDeDia/limitaciones-usuario/${uid}/${id}`), true);
    }

    sessionStorage.clear(); // Limpiar textos temporales tras guardar
    estado.textContent = "Cambios guardados correctamente.";

    window.location.href = "panel.html";

  });

  function guardarTextosTemporalmente() {
    const inputs = document.querySelectorAll("input.texto-input");
    inputs.forEach(input => {
      sessionStorage.setItem(input.id, input.value);
    });
  }
});
