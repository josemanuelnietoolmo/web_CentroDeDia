import { database } from './firebase-config.js';
import {
  ref as dbRef,
  get
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js';

document.addEventListener("DOMContentLoaded", async () => {
  const resultadosDiv = document.getElementById("resultadosEdad");

  const usuariosSnap = await get(dbRef(database, "CentroDeDia/usuarios"));
  const experienciasSnap = await get(dbRef(database, "CentroDeDia/experiencias"));

  if (!usuariosSnap.exists()) {
    resultadosDiv.textContent = "No hay usuarios registrados.";
    return;
  }

  const usuarios = usuariosSnap.val();
  const experiencias = experienciasSnap.exists() ? experienciasSnap.val() : {};

  const rangos = {
    "<70": [],
    "70-80": [],
    ">80": []
  };

  // Clasifica usuarios por edad
  Object.entries(usuarios).forEach(([id, user]) => {
    const edad = parseInt(user.edad);
    if (edad < 70) rangos["<70"].push(id);
    else if (edad <= 80) rangos["70-80"].push(id);
    else rangos[">80"].push(id);
  });

  const resultados = {};

  for (const [rango, userIDs] of Object.entries(rangos)) {
    const datos = {
      totalUsuarios: userIDs.length,
      totalExperiencias: 0,
      totalTiempo: 0,
      totalNota: 0,
      conteoSalas: {
        bosque: 0,
        museo: 0
      },
      salas: {
        bosque: { visitas: 0, tiempoTotal: 0, notaTotal: 0 },
        museo: { visitas: 0, tiempoTotal: 0, notaTotal: 0 }
      }
    };
    console.log("Datos:", datos);

    Object.entries(experiencias).forEach(([expID, exp]) => {
      console.log("EXP:", exp);
    
      const userID = exp.usuario;
      const sala = exp.sala;
      if (!userID || !userIDs.includes(userID)) return;
    
      console.log(`Usuario ${userID} pertenece al rango ${rango}`);
    
      const dur = parseInt(exp.duración) || 0;
      const nota = parseInt(exp.feedback) || 0;
    
      let salaNormalizada = "";
      if (sala.toLowerCase().includes("bosque")) {
        salaNormalizada = "bosque";
      } else if (sala.toLowerCase().includes("museo")) {
        salaNormalizada = "museo";
      } else {
        console.log(`Sala desconocida: ${sala}`);
        return;
      }
    
      console.log(`Sala original: ${sala}, normalizada: ${salaNormalizada}`);
    
      datos.totalExperiencias++;
      datos.totalTiempo += dur;
      datos.totalNota += nota;
    
      datos.conteoSalas[salaNormalizada]++;
      datos.salas[salaNormalizada].visitas++;
      datos.salas[salaNormalizada].tiempoTotal += dur;
      datos.salas[salaNormalizada].notaTotal += nota;
    });
    

    const mediaTiempo = datos.totalExperiencias ? (datos.totalTiempo / datos.totalExperiencias).toFixed(1) : "0";
    const mediaNota = datos.totalExperiencias ? (datos.totalNota / datos.totalExperiencias).toFixed(1) : "0";

    const salaFavorita =
      datos.conteoSalas.bosque > datos.conteoSalas.museo
        ? "Bosque Encantado"
        : datos.conteoSalas.museo > datos.conteoSalas.bosque
        ? "Museo de los Recuerdos"
        : "empate";

    const bosque = datos.salas.bosque;
    console.log("BOSQUE:", bosque);
    const museo = datos.salas.museo;
    console.log("MUSEO:", museo);

    resultados[rango] = {
      totalUsuarios: datos.totalUsuarios,
      totalExperiencias: datos.totalExperiencias,
      salaFavorita,
      mediaTiempo,
      mediaNota,
      detalleSalas: {
        bosque: {
          visitas: bosque.visitas,
          mediaTiempo: bosque.visitas ? (bosque.tiempoTotal / bosque.visitas).toFixed(1) : "0",
          mediaNota: bosque.visitas ? (bosque.notaTotal / bosque.visitas).toFixed(1) : "0"
        },
        museo: {
          visitas: museo.visitas,
          mediaTiempo: museo.visitas ? (museo.tiempoTotal / museo.visitas).toFixed(1) : "0",
          mediaNota: museo.visitas ? (museo.notaTotal / museo.visitas).toFixed(1) : "0"
        }
      }
    };
  }

  // Mostrar resultados
  resultadosDiv.innerHTML = "<h2>Estadísticas por Rango de Edad</h2>";
  for (const [rango, data] of Object.entries(resultados)) {
    resultadosDiv.innerHTML += `
      <div class="bloque-edad">
        <h3>Rango ${rango}</h3>
        <ul>
          <li>Usuarios: <strong>${data.totalUsuarios}</strong></li>
          <li>Total experiencias: <strong>${data.totalExperiencias}</strong></li>
          <li>Sala favorita: <strong>${data.salaFavorita}</strong></li>
          <li>Tiempo medio por experiencia: <strong>${data.mediaTiempo} min</strong></li>
          <li>Nota media: <strong>${data.mediaNota}/10</strong></li>
        </ul>
        <h4>Detalle por sala:</h4>
        <ul>
          <li><strong>Bosque Encantado:</strong>
            <ul>
              <li>Visitas: ${data.detalleSalas.bosque.visitas}</li>
              <li>Tiempo medio: ${data.detalleSalas.bosque.mediaTiempo} min</li>
              <li>Nota media: ${data.detalleSalas.bosque.mediaNota}/10</li>
            </ul>
          </li>
          <li><strong>Museo de los Recuerdos:</strong>
            <ul>
              <li>Visitas: ${data.detalleSalas.museo.visitas}</li>
              <li>Tiempo medio: ${data.detalleSalas.museo.mediaTiempo} min</li>
              <li>Nota media: ${data.detalleSalas.museo.mediaNota}/10</li>
            </ul>
          </li>
        </ul>
      </div>
    `;
  }

  const ctx = document.getElementById('graficoExperiencias').getContext('2d');

const rangosEdad = Object.keys(resultados);
const totalExp = rangosEdad.map(r => resultados[r].totalExperiencias);
const notasMedia = rangosEdad.map(r => resultados[r].mediaNota);
const tiempoMedio = rangosEdad.map(r => resultados[r].mediaTiempo);

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: rangosEdad,
    datasets: [
      {
        label: 'Total experiencias',
        data: totalExp,
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      {
        label: 'Nota media',
        data: notasMedia,
        backgroundColor: 'rgba(255, 159, 64, 0.5)'
      },
      {
        label: 'Tiempo medio (min)',
        data: tiempoMedio,
        backgroundColor: 'rgba(153, 102, 255, 0.5)'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Comparativa por rango de edad'
      }
    }
  }
});

});
