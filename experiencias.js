import { database } from './firebase-config.js';
import { ref, get, remove } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js';

const params = new URLSearchParams(window.location.search);
const userId = params.get('uid');
const contenedor = document.getElementById("experiencias");
const analisisContenedor = document.getElementById("analisis");

if (!userId) {
  contenedor.textContent = "No se proporcionó un ID de usuario.";
} else {
  const experienciasRef = ref(database, 'CentroDeDia/experiencias');

  get(experienciasRef).then((snapshot) => {
    if (!snapshot.exists()) {
      contenedor.textContent = "No hay experiencias registradas.";
      return;
    }

    const experienciasUsuario = [];
    let tieneExperiencias = false;

    snapshot.forEach((child) => {
      const expData = child.val();
      const expId = child.key;

      if (expData.usuario === userId) {
        tieneExperiencias = true;
        experienciasUsuario.push(expData);

        const div = document.createElement("div");
        div.className = "experiencia-item";
        div.style.border = "1px solid #ccc";
        div.style.margin = "10px 0";
        div.style.padding = "10px";

        const info = `
          <p><strong>Fecha:</strong> ${expData.fecha}</p>
          <p><strong>Duración:</strong> ${expData.duración} minutos</p>
          <p><strong>Feedback:</strong> ${expData.feedback}/10</p>
          <p><strong>Sala:</strong> ${expData.sala}</p>
        `;
        div.innerHTML = info;

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar experiencia";
        btnEliminar.style.backgroundColor = "#f44336";
        btnEliminar.style.color = "white";
        btnEliminar.onclick = () => {
          const confirmacion = confirm("¿Eliminar esta experiencia?");
          if (confirmacion) {
            const expRef = ref(database, `CentroDeDia/experiencias/${expId}`);
            remove(expRef)
              .then(() => {
                alert("Experiencia eliminada.");
                location.reload();
              })
              .catch((err) => {
                console.error("Error al eliminar experiencia:", err);
                alert("Error al eliminar experiencia.");
              });
          }
        };

        div.appendChild(btnEliminar);
        contenedor.appendChild(div);
      }
    });

    if (!tieneExperiencias) {
      contenedor.textContent = "Este usuario no tiene experiencias registradas.";
      return;
    }

    // ANÁLISIS
    const total = experienciasUsuario.length;
    const mediaDuracion = (experienciasUsuario.reduce((s, e) => s + (e.duración || 0), 0) / total).toFixed(1);
    const mediaFeedback = (experienciasUsuario.reduce((s, e) => s + (e.feedback || 0), 0) / total).toFixed(1);

    const contadorSalas = experienciasUsuario.reduce((acc, e) => {
      acc[e.sala] = (acc[e.sala] || 0) + 1;
      return acc;
    }, {});

    const salaPreferida = Object.entries(contadorSalas).sort((a, b) => b[1] - a[1])[0][0];

    let sugerencia = "";
    if (mediaFeedback >= 8) {
      sugerencia = `✅ Este usuario disfruta mucho las sesiones. Se recomienda mantener la frecuencia y variedad.`;
    } else if (mediaFeedback >= 5) {
      sugerencia = `⚠️ El interés del usuario es medio. Se sugiere ajustar la duración o cambiar de entorno.`;
    } else {
      sugerencia = `❌ El usuario muestra poco disfrute. Considere cambiar el tipo de sala o revisar la dificultad.`;
    }

    
    analisisContenedor.innerHTML = `
      <h2>Análisis de Experiencias</h2>
      <h3>Análisis general</h3>
      <ul>
        <li><strong>Total de experiencias:</strong> ${total}</li>
        <li><strong>Duración media:</strong> ${mediaDuracion} minutos</li>
        <li><strong>Feedback medio:</strong> ${mediaFeedback} / 10</li>
        <li><strong>Sala más usada:</strong> ${salaPreferida}</li>
      </ul>
      <p><strong>Sugerencia:</strong> ${sugerencia}</p>
    `;

    // ANÁLISIS POR SALA
    let analisisPorSalaHTML = "<h3>Análisis por sala</h3>";

    for (const sala in contadorSalas) {
      const experienciasSala = experienciasUsuario.filter(e => e.sala === sala);
      const totalSala = experienciasSala.length;
      const mediaDuracionSala = (experienciasSala.reduce((s, e) => s + (e.duración || 0), 0) / totalSala).toFixed(1);
      const mediaFeedbackSala = (experienciasSala.reduce((s, e) => s + (e.feedback || 0), 0) / totalSala).toFixed(1);

      let sugerenciaSala = "";
      if (mediaFeedbackSala >= 8) {
        sugerenciaSala = "👍 Muy positiva. Repetir con frecuencia.";
      } else if (mediaFeedbackSala >= 5) {
        sugerenciaSala = "🟡 Aceptable. Posible ajuste de duración o contenido.";
      } else {
        sugerenciaSala = "🔴 Baja valoración. Mejor evitar esta sala o adaptarla.";
      }

      analisisPorSalaHTML += `
        <h4>${sala}</h4>
        <ul>
          <li><strong>Número de sesiones:</strong> ${totalSala}</li>
          <li><strong>Duración media:</strong> ${mediaDuracionSala} minutos</li>
          <li><strong>Feedback medio:</strong> ${mediaFeedbackSala} / 10</li>
          <li><strong>Observación:</strong> ${sugerenciaSala}</li>
        </ul>
      `;
    }

    analisisContenedor.innerHTML += analisisPorSalaHTML;

    let gráficas = "<h3>Gráficas</h3>";
    analisisContenedor.innerHTML += gráficas;
;
    
    for (const sala in contadorSalas) {
      const salaId = `graficoFeedback_${sala.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, "_")}`;
      analisisContenedor.innerHTML += `<h4>Feedback a lo largo del tiempo - ${sala}</h4><canvas id="${salaId}" style="max-width: 100%;"></canvas>`;
    
      const experienciasSala = experienciasUsuario.filter(e => e.sala === sala);
      const fechas = experienciasSala.map(e => e.fecha);
      const feedbacks = experienciasSala.map(e => e.feedback);
    
      setTimeout(() => {
        const ctx = document.getElementById(salaId).getContext('2d');
        
        const media = (
          feedbacks.reduce((sum, val) => sum + (val || 0), 0) / feedbacks.length
        ).toFixed(1);
      
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: fechas,
            datasets: [
              {
                label: `Feedback (${sala})`,
                data: feedbacks,
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
              },
              {
                type: 'line',
                label: `Media: ${media}`,
                data: new Array(feedbacks.length).fill(media),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0, // sin puntos
                tension: 0 // línea recta
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 10
              }
            }
          }
        });
      }, 0);
      
    }
    

    // === GRAFICO DE PORCENTAJE POR SALA ===
    const salas = Object.keys(contadorSalas);
    const cantidades = Object.values(contadorSalas);
    // Ajustar el tamaño del gráfico

    const ctx2 = document.getElementById('graficoSalas').getContext('2d');
    new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: salas,
        datasets: [{
          data: cantidades,
          backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#e91e63']
        }]
      },
      options: {
        responsive: true
      }
    });

  });
}
