/**
 * Academia CiberSegura Suiche7B - Customizer Control Panel
 * Lógica para la administración interactiva de casos de juego,
 * edición en tiempo real e importación/exportación de plantillas JSON de entrenamiento.
 */

class TemplateCustomizer {
  constructor() {
    this.activeTab = 'phishing';
  }

  selectTab(tabId, menuItemElement) {
    app.playAudio('click');
    this.activeTab = tabId;

    // Actualizar estados visuales del menú lateral del customizer
    const items = document.querySelectorAll('.customizer-menu-item');
    items.forEach(item => item.classList.remove('active'));
    if (menuItemElement) {
      menuItemElement.classList.add('active');
    }

    this.renderEditor();
  }

  renderEditor() {
    const container = document.getElementById('customizer-editor-content');
    if (!container) return;

    container.innerHTML = '';

    switch (this.activeTab) {
      case 'phishing':
        this.renderPhishingEditor(container);
        break;
      case 'pci':
        this.renderPciEditor(container);
        break;
      case 'incident':
        this.renderIncidentEditor(container);
        break;
      case 'import-export':
        this.renderImportExport(container);
        break;
    }
  }

  // --- EDITOR DE CASOS DE PHISHING ---
  renderPhishingEditor(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--primary-light);">✍️ Administrador de Casos de Phishing</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Modifica los casos de simulación de correo electrónico. Puedes adaptar los remitentes y enlaces para simular ataques dirigidos reales (Spear Phishing).</p>
      
      <div class="customizer-form">
        ${games.phishing.cases.map((c, idx) => `
          <div class="sidebar-panel" style="background:rgba(255,255,255,0.01); border-color:rgba(255,255,255,0.05); margin-bottom:1rem; padding:1.2rem;">
            <h4 style="color:var(--accent-cyan); font-size:0.95rem; margin-bottom:0.8rem; display:flex; justify-content:between;">
              <span>Caso ${idx + 1}: ${c.isSafe ? '🟢 Seguro' : '🔴 Phishing'}</span>
            </h4>
            
            <div class="input-group">
              <label>Remitente (De:)</label>
              <input type="text" class="text-input" id="phish-from-${idx}" value="${c.from}">
            </div>
            
            <div class="input-group">
              <label>Asunto:</label>
              <input type="text" class="text-input" id="phish-subject-${idx}" value="${c.subject}">
            </div>
            
            <div class="input-group">
              <label>Cuerpo del Mensaje (HTML permitido):</label>
              <textarea class="text-input" id="phish-body-${idx}" style="min-height:120px; font-family:var(--font-mono); font-size:0.85rem;">${c.body.trim()}</textarea>
            </div>

            <div class="input-group">
              <label>Explicación Educativa:</label>
              <textarea class="text-input" id="phish-exp-${idx}" style="min-height:60px;">${c.explanation}</textarea>
            </div>
          </div>
        `).join('')}

        <div class="customizer-action-bar">
          <button class="btn btn-primary" onclick="customizer.savePhishingChanges()">
            💾 Guardar Casos de Phishing
          </button>
          <button class="btn btn-secondary" onclick="customizer.resetPhishingDefaults()">
            🔄 Restablecer Predeterminados
          </button>
        </div>
      </div>
    `;
  }

  savePhishingChanges() {
    games.phishing.cases.forEach((c, idx) => {
      const fromVal = document.getElementById(`phish-from-${idx}`).value;
      const subVal = document.getElementById(`phish-subject-${idx}`).value;
      const bodyVal = document.getElementById(`phish-body-${idx}`).value;
      const expVal = document.getElementById(`phish-exp-${idx}`).value;

      c.from = fromVal;
      c.subject = subVal;
      c.body = bodyVal;
      c.explanation = expVal;
    });

    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Casos de Phishing Guardados',
      message: 'Los casos de simulación de correo electrónico se han actualizado con éxito en tiempo real.',
      type: 'success'
    }).then(() => {
      app.navigateTo('dashboard');
    });
  }

  resetPhishingDefaults() {
    app.showModalConfirm({
      title: '🔄 ¿Restablecer Predeterminados?',
      message: '¿Estás seguro de que deseas restaurar los casos de phishing predeterminados de fábrica? Se perderán las modificaciones actuales.',
      type: 'warning'
    }).then(confirmed => {
      if (confirmed) {
        games.phishing = new PhishingGame();
        app.playAudio('complete');
        this.renderEditor();
      }
    });
  }

  // --- EDITOR DE CLASIFICACIÓN DE OFICINA SEGURA ---
  renderPciEditor(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--accent-green);">🧹 Parámetros de Escritorio Limpio (Oficina Segura)</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Edita las descripciones y categorías de los hábitos de oficina que los colaboradores deben clasificar.</p>
      
      <div class="customizer-form">
        ${games.pci.dataItems.map((item, idx) => `
          <div class="sidebar-panel" style="background:rgba(255,255,255,0.01); border-color:rgba(255,255,255,0.05); margin-bottom:1rem; padding:1.2rem;">
            <h4 style="color:var(--accent-green); font-size:0.95rem; margin-bottom:0.8rem;">
              Hábito: ${item.name}
            </h4>
            
            <div class="input-group">
              <label>Descripción / Detalle del Hábito:</label>
              <input type="text" class="text-input" id="pci-desc-${idx}" value="${item.desc}">
            </div>

            <div class="input-group">
              <label>Clasificación Correcta:</label>
              <select class="select-input" id="pci-vault-${idx}">
                <option value="safe" ${item.category === 'safe' ? 'selected' : ''}>🟢 Buena Práctica (Seguridad Activa)</option>
                <option value="forbidden" ${item.category === 'forbidden' ? 'selected' : ''}>🔴 Riesgo de Seguridad (Infracción)</option>
              </select>
            </div>
          </div>
        `).join('')}

        <div class="customizer-action-bar">
          <button class="btn btn-primary" onclick="customizer.savePciChanges()">
            💾 Guardar Cambios de Oficina Segura
          </button>
        </div>
      </div>
    `;
  }

  savePciChanges() {
    games.pci.dataItems.forEach((item, idx) => {
      const descVal = document.getElementById(`pci-desc-${idx}`).value;
      const catVal = document.getElementById(`pci-vault-${idx}`).value;

      item.desc = descVal;
      item.category = catVal;
    });

    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Configuración Guardada',
      message: 'La configuración de Oficina Segura (Escritorio Limpio) se ha guardado con éxito.',
      type: 'success'
    }).then(() => {
      app.navigateTo('dashboard');
    });
  }

  // --- EDITOR DEL SIMULADOR DE INCIDENTES ---
  renderIncidentEditor(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--accent-red-light);">🚨 Editor de Diálogos de Ingeniería Social (Vishing)</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Modifica los textos narrativos de la aventura de Vishing y SMS para adaptarlos a situaciones reales de la oficina.</p>
      
      <div class="customizer-form" style="max-height:450px; overflow-y:auto; padding-right:0.5rem;">
        ${Object.keys(games.incident.nodes).map(nodeId => {
          const node = games.incident.nodes[nodeId];
          return `
            <div class="sidebar-panel" style="background:rgba(255,255,255,0.01); border-color:rgba(255,255,255,0.05); margin-bottom:1rem; padding:1.2rem;">
              <h4 style="color:var(--accent-red-light); font-size:0.9rem; font-family:var(--font-mono); margin-bottom:0.5rem;">
                Nodo: ${nodeId}
              </h4>
              <div class="input-group">
                <label>Texto Narrativo:</label>
                <textarea class="text-input" id="inc-node-text-${nodeId}" style="min-height:80px; font-size:0.85rem;">${node.text}</textarea>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="customizer-action-bar">
        <button class="btn btn-primary" onclick="customizer.saveIncidentChanges()">
          💾 Guardar Narrativa de Vishing
        </button>
      </div>
    `;
  }

  saveIncidentChanges() {
    Object.keys(games.incident.nodes).forEach(nodeId => {
      const textVal = document.getElementById(`inc-node-text-${nodeId}`).value;
      games.incident.nodes[nodeId].text = textVal;
    });

    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Narrativa Guardada',
      message: 'La narrativa y los diálogos de la simulación de incidentes se han guardado con éxito.',
      type: 'success'
    }).then(() => {
      app.navigateTo('dashboard');
    });
  }

  // --- EXPORTACIÓN E IMPORTACIÓN DE PLANTILLAS JSON ---
  renderImportExport(container) {
    const fullConfig = {
      phishing: games.phishing.cases,
      pci: games.pci.dataItems,
      incident: games.incident.nodes
    };

    const jsonString = JSON.stringify(fullConfig, null, 2);

    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--text-main);">💾 Resguardo y Carga de Plantillas Personalizadas</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Copia este JSON para respaldar tus escenarios editados de ciberseguridad, o pega una plantilla pre-diseñada y presiona 'Importar' para actualizar la academia de entrenamiento al instante.</p>
      
      <div class="customizer-form">
        <div class="input-group">
          <label>Plantilla Completa de Entrenamiento (JSON):</label>
          <textarea class="text-input" id="json-template-area" style="min-height:280px; font-family:var(--font-mono); font-size:0.75rem; line-height:1.4; color:var(--accent-cyan);">${jsonString}</textarea>
        </div>

        <div style="display:flex; gap:1rem;">
          <button class="btn btn-success" onclick="customizer.importTemplate()" style="flex:1;">
            📥 Importar Plantilla JSON
          </button>
          <button class="btn btn-primary" onclick="customizer.downloadTemplate()" style="flex:1;">
            📤 Descargar Archivo .json
          </button>
        </div>
      </div>
    `;
  }

  importTemplate() {
    const text = document.getElementById('json-template-area').value;
    try {
      const parsed = JSON.parse(text);
      
      if (parsed.phishing && parsed.pci && parsed.incident) {
        games.phishing.cases = parsed.phishing;
        games.pci.dataItems = parsed.pci;
        games.incident.nodes = parsed.incident;
        
        // Guardar configuración modificada en LocalStorage global
        const savedState = localStorage.getItem('s7b_cybershield_state');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Podemos persistir las modificaciones de juegos también en el estado
          parsedState.customGamesConfig = parsed;
          localStorage.setItem('s7b_cybershield_state', JSON.stringify(parsedState));
        }

        app.playAudio('complete');
        app.showModalAlert({
          title: '📥 Plantilla Importada',
          message: '¡Plantilla importada con éxito! La academia se ha actualizado con tus nuevos escenarios.',
          type: 'success'
        }).then(() => {
          app.navigateTo('dashboard');
        });
      } else {
        app.showModalAlert({
          title: '❌ Error de Estructura',
          message: 'Estructura de JSON inválida. Asegúrate de incluir los nodos "phishing", "pci" e "incident".',
          type: 'danger'
        });
      }
    } catch (e) {
      app.playAudio('incorrect');
      app.showModalAlert({
        title: '❌ Error de Procesamiento',
        message: 'Error al procesar el JSON: ' + e.message,
        type: 'danger'
      });
    }
  }

  downloadTemplate() {
    const fullConfig = {
      phishing: games.phishing.cases,
      pci: games.pci.dataItems,
      incident: games.incident.nodes
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "suiche7b_cybershield_template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    app.playAudio('complete');
  }
}

// Iniciar controlador en window
const customizer = new TemplateCustomizer();
window.customizer = customizer;
