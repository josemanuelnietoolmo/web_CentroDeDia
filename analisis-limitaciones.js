import { database } from './firebase-config.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js';

const resultadosDiv = document.getElementById('resultadosLimitaciones');

const refLimitaciones = ref(database, 'CentroDeDia/limitaciones');
const refLimitacionesUsuario = ref(database, 'CentroDeDia/limitaciones-usuario');
const refExperiencias = ref(database, 'CentroDeDia/experiencias');

const limitacionesMap = {};      // id → nombre
const usuariosPorLimitacion = {}; // limitacionId → [userID]
const experienciasPorUsuario = {}; // userID → [experiencias]

onValue(refLimitaciones, (snapLim) => {
  snapLim.forEach(child => {
    limitacionesMap[child.key] = child.val().nombreLimitacion;
    usuariosPorLimitacion[child.key] = [];
  });

  onValue(refLimitacionesUsuario, (snapUsuLim) => {
    snapUsuLim.forEach(usuarioSnap => {
      const userID = usuarioSnap.key;
      const limitaciones = usuarioSnap.val();
      if (limitaciones) {
        Object.keys(limitaciones).forEach(limID => {
          if (usuariosPorLimitacion[limID]) {
            usuariosPorLimitacion[limID].push(userID);
          }
        });
      }
    });

    onValue(refExperiencias, (snapExp) => {
      snapExp.forEach(expSnap => {
        const exp = expSnap.val();
        const userID = exp.usuario;
        if (!experienciasPorUsuario[userID]) experienciasPorUsuario[userID] = [];
        experienciasPorUsuario[userID].push(exp);
      });

      mostrarAnalisis();
    });
  });
}, { onlyOnce: true });

function mostrarAnalisis() {
  resultadosDiv.innerHTML = "<h2>Estadísticas por Limitación</h2>";

  for (const limID in usuariosPorLimitacion) {
    const nombre = limitacionesMap[limID];
    const userIDs = usuariosPorLimitacion[limID];

    const experiencias = userIDs.flatMap(uid => experienciasPorUsuario[uid] || []);

    const porSala = {};
    experiencias.forEach(exp => {
      if (!porSala[exp.sala]) porSala[exp.sala] = [];
      porSala[exp.sala].push(exp);
    });

    let html = `
      <div class="bloque-limitacion">
        <h3>${nombre}</h3>
    `;

    if (experiencias.length === 0) {
      html += "<p>No hay experiencias registradas para esta limitación.</p>";
    } else {
      for (const sala in porSala) {
        const datos = porSala[sala];
        const durMedia = (datos.reduce((s, e) => s + (e.duración || 0), 0) / datos.length).toFixed(1);
        const fbMedia = (datos.reduce((s, e) => s + (e.feedback || 0), 0) / datos.length).toFixed(1);

        html += `
          <p><strong>${sala}</strong><br>
          Número de sesiones: ${datos.length}<br>
          Duración media: ${durMedia} min<br>
          Feedback medio: ${fbMedia} / 10</p>
        `;
      }
    }

    html += `</div>`;
    resultadosDiv.innerHTML += html;
  }
}
