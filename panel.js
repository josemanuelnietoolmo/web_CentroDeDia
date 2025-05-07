import { auth, database, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { ref, onValue, get ,remove } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js';
import { ref as storageRef, listAll, deleteObject } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js';



onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    cargarUsuarios();
  }
});

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

function cargarUsuarios() {
  const usuariosRef = ref(database, 'CentroDeDia/usuarios');
  const contenedor = document.getElementById("usuarios");
  contenedor.innerHTML = "";

  onValue(usuariosRef, (snapshot) => {
    contenedor.innerHTML = "";
    snapshot.forEach(child => {
      const datos = child.val();
      const userId = child.key;
      const div = document.createElement("div");
      div.className = "usuario-item";
      div.style.width = "100%";
      div.marginBottom = "2px";

      // NUEVO contenedor horizontal
      const fila = document.createElement("div");
      fila.style.display = "flex";
      fila.style.width = "100%"; // Ajustar al ancho del contenedor
      fila.style.boxSizing = "border-box"; // Incluir padding y borde en el ancho total
      fila.style.border = "1px solid #ddd"; // Borde suave
      fila.style.borderRadius = "5px"; // Bordes redondeados
      fila.style.padding = "10px 10px"; // Espaciado interno
      fila.style.gap = "20px"; // Añadir un espacio entre el nombre y los botones
      fila.style.margin = "10px 10px";
      fila.style.alignItems = "center"; // Alinear verticalmente al centro
      

      const nombre = document.createElement("span");
      nombre.textContent = datos.userName || userId;

      const botones = document.createElement("div");

      const btnModificar = document.createElement("button");
      btnModificar.textContent = "Modificar";
      btnModificar.style.marginLeft = "10px";
      btnModificar.addEventListener("click", () => {
        window.location.href = `editar.html?uid=${userId}`;
      });

      const btnVerExperiencias = document.createElement("button");
      btnVerExperiencias.textContent = "Análisis experiencias";
      btnVerExperiencias.style.marginLeft = "10px";
      btnVerExperiencias.style.backgroundColor = "#f38e21";
      btnVerExperiencias.style.color = "white";
      btnVerExperiencias.onclick = () => {
        window.location.href = `experiencias.html?uid=${userId}`;
      };


      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.style.marginLeft = "10px";
      btnEliminar.style.backgroundColor = "#f44336";
      btnEliminar.style.color = "white";
      btnEliminar.onclick = () => {
        const confirmacion = confirm(`¿Estás seguro de eliminar a ${datos.userName}?`);
        if (confirmacion) {
          const userRef = ref(database, `CentroDeDia/usuarios/${userId}`);
          const limitacionesRef = ref(database, `CentroDeDia/limitaciones-usuario/${userId}`);
          const userStorageRef = storageRef(storage, userId);
          const experienciasRef = ref(database, `CentroDeDia/experiencias`);

          Promise.all([
            remove(userRef),
            remove(limitacionesRef)
          ])
            .then(() => get(experienciasRef))
            .then((snapshot) => {
              if (snapshot.exists()) {
                const experiencias = snapshot.val();
                const deleteExperiencias = [];

                Object.entries(experiencias).forEach(([expId, expData]) => {
                  if (expData.usuario === userId) {
                    const expRef = ref(database, `CentroDeDia/experiencias/${expId}`);
                    deleteExperiencias.push(remove(expRef));
                  }
                });

                return Promise.all(deleteExperiencias);
              }
            })
            .then(() => listAll(userStorageRef))
            .then((res) => {
              const deletePromises = res.items.map((itemRef) => deleteObject(itemRef));
              return Promise.all(deletePromises);
            })
            .then(() => {
              alert("Usuario, limitaciones, experiencias y archivos eliminados correctamente.");
            })
            .catch((err) => {
              console.error("Error durante la eliminación:", err);
              alert("Hubo un error al eliminar completamente los datos del usuario.");
            });
        }
      };

      botones.appendChild(btnVerExperiencias);
      botones.appendChild(btnModificar);
      botones.appendChild(btnEliminar);

      // Añadir nombre y botones a la fila horizontal
      fila.appendChild(nombre);
      fila.appendChild(botones);
      div.appendChild(fila);
      contenedor.appendChild(div);
    });
  });
}


window.buscarUsuario = function () {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const usuariosRef = ref(database, 'CentroDeDia/usuarios');
  const contenedor = document.getElementById("usuarios");
  contenedor.innerHTML = "";

  onValue(usuariosRef, (snapshot) => {
    contenedor.innerHTML = "";
    snapshot.forEach(child => {
      const datos = child.val();
      const userId = child.key;
      const userName = (datos.userName || userId).toLowerCase();

      if (userName.includes(searchInput)) {
        const div = document.createElement("div");
        div.className = "usuario-item";

        const nombre = document.createElement("span");
        nombre.textContent = datos.userName || userId;

        const botones = document.createElement("div");

        const btnModificar = document.createElement("button");
        btnModificar.textContent = "Modificar";
        btnModificar.style.marginLeft = "10px";
        btnModificar.addEventListener("click", () => {
          window.location.href = `editar.html?uid=${userId}`;
        });

      const btnVerExperiencias = document.createElement("button");
      btnVerExperiencias.textContent = "Análisis experiencias";
      btnVerExperiencias.style.marginLeft = "10px";
      btnVerExperiencias.style.backgroundColor = "#f38e21";
      btnVerExperiencias.style.color = "white";
      btnVerExperiencias.onclick = () => {
        window.location.href = `experiencias.html?uid=${userId}`;
      };

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.style.marginLeft = "10px";
        btnEliminar.style.backgroundColor = "#f44336";
        btnEliminar.style.color = "white";
        btnEliminar.onclick = () => {
          const confirmacion = confirm(`¿Estás seguro de eliminar a ${datos.userName}?`);
          if (confirmacion) {
            const userRef = ref(database, `CentroDeDia/usuarios/${userId}`);
            const limitacionesRef = ref(database, `CentroDeDia/limitaciones-usuario/${userId}`);
            const userStorageRef = storageRef(storage, userId);
            const experienciasRef = ref(database, `CentroDeDia/experiencias`);

            Promise.all([
              remove(userRef),
              remove(limitacionesRef)
            ])
              .then(() => get(experienciasRef))
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const experiencias = snapshot.val();
                  const deleteExperiencias = [];

                  Object.entries(experiencias).forEach(([expId, expData]) => {
                    if (expData.usuario === userId) {
                      const expRef = ref(database, `CentroDeDia/experiencias/${expId}`);
                      deleteExperiencias.push(remove(expRef));
                    }
                  });

                  return Promise.all(deleteExperiencias);
                }
              })
              .then(() => listAll(userStorageRef))
              .then((res) => {
                const deletePromises = res.items.map((itemRef) => deleteObject(itemRef));
                return Promise.all(deletePromises);
              })
              .then(() => {
                alert("Usuario, limitaciones, experiencias y archivos eliminados correctamente.");
              })
              .catch((err) => {
                console.error("Error durante la eliminación:", err);
                alert("Hubo un error al eliminar completamente los datos del usuario.");
              });
          }
        };

        botones.appendChild(btnVerExperiencias);
        botones.appendChild(btnModificar);
        botones.appendChild(btnEliminar);
       
        div.className = "usuario-item";
        div.style.width = "100%";
        div.marginBottom = "2px";
        const fila = document.createElement("div");
        fila.style.display = "flex";
        fila.style.width = "100%"; // Ajustar al ancho del contenedor
        fila.style.boxSizing = "border-box"; // Incluir padding y borde en el ancho total
        fila.style.border = "1px solid #ddd"; // Borde suave
        fila.style.borderRadius = "5px"; // Bordes redondeados
        fila.style.padding = "10px 10px"; // Espaciado interno
        fila.style.gap = "20px"; // Añadir un espacio entre el nombre y los botones
        fila.style.margin = "10px 10px";
        fila.style.alignItems = "center"; // Alinear verticalmente al centro

        fila.appendChild(nombre);
        fila.appendChild(botones);
        div.appendChild(fila);
        contenedor.appendChild(div);

      }
    });
  });
};