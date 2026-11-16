/**
 * Academia CiberSegura Suiche7B - Customizer Control Panel (Fase 1 + Fase 2 + Persistencia PostgreSQL)
 * Lógica para la administración interactiva de casos de juego,
 * edición en tiempo real, sincronización en base de datos e importación/exportación JSON.
 */

class TemplateCustomizer {
  constructor() {
    this.activeTab = 'phishing';
  }

  selectTab(tabId, menuItemElement) {
    app.playAudio('click');
    this.activeTab = tabId;

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
      case 'phase2':
        this.renderPhase2Editor(container);
        break;
      case 'import-export':
        this.renderImportExport(container);
        break;
    }
  }

  // Persistir configuración completa en PostgreSQL (si es Admin) y LocalStorage
  async syncScenariosToServer() {
    const fullConfig = this.getFullConfigObject();

    try {
      const savedState = localStorage.getItem('s7b_cybershield_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        parsedState.customGamesConfig = fullConfig;
        localStorage.setItem('s7b_cybershield_state', JSON.stringify(parsedState));
      }
    } catch (e) {
      console.warn('Error guardando escenarios en localStorage:', e);
    }

    if (window.app && app.state.user && app.state.user.token && app.state.user.isAdmin) {
      try {
        await fetch('/api/v1/settings/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${app.state.user.token}`
          },
          body: JSON.stringify(fullConfig)
        });
      } catch (e) {
        console.warn('Aviso: No se pudo sincronizar escenarios con PostgreSQL:', e);
      }
    }
  }

  getFullConfigObject() {
    return {
      phishing: games.phishing.cases,
      pci: games.pci.dataItems,
      incident: games.incident.nodes,
      ai_sec: games.ai_sec.cases,
      pci_dss: games.pci_dss.items,
      quishing_mfa: games.quishing_mfa.cases,
      bec_fraud: games.bec_fraud.cases,
      remote_vpn: games.remote_vpn.cases
    };
  }

  applyFullConfigObject(parsed) {
    if (!parsed || typeof parsed !== 'object') return;
    if (Array.isArray(parsed.phishing)) games.phishing.cases = parsed.phishing;
    if (Array.isArray(parsed.pci)) games.pci.dataItems = parsed.pci;
    if (parsed.incident && typeof parsed.incident === 'object') games.incident.nodes = parsed.incident;
    if (Array.isArray(parsed.ai_sec)) games.ai_sec.cases = parsed.ai_sec;
    if (Array.isArray(parsed.pci_dss)) games.pci_dss.items = parsed.pci_dss;
    if (Array.isArray(parsed.quishing_mfa)) games.quishing_mfa.cases = parsed.quishing_mfa;
    if (Array.isArray(parsed.bec_fraud)) games.bec_fraud.cases = parsed.bec_fraud;
    if (Array.isArray(parsed.remote_vpn)) games.remote_vpn.cases = parsed.remote_vpn;
  }

  // --- EDITOR DE CASOS DE PHISHING (FASE 1) ---
  renderPhishingEditor(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--primary-light);">✍️ Administrador de Casos de Phishing (Fase 1)</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Modifica los casos de simulación de correo electrónico. Al guardar como Administrador, los cambios se sincronizan en PostgreSQL para toda la Corporación.</p>
      
      <div class="customizer-form">
        ${games.phishing.cases.map((c, idx) => `
          <div class="sidebar-panel" style="background:rgba(255,255,255,0.01); border-color:rgba(255,255,255,0.05); margin-bottom:1rem; padding:1.2rem;">
            <h4 style="color:var(--accent-cyan); font-size:0.95rem; margin-bottom:0.8rem;">
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
              <textarea class="text-input" id="phish-body-${idx}" style="min-height:110px; font-family:var(--font-mono); font-size:0.82rem;">${c.body.trim()}</textarea>
            </div>

            <div class="input-group">
              <label>Explicación Educativa:</label>
              <textarea class="text-input" id="phish-exp-${idx}" style="min-height:60px;">${c.explanation}</textarea>
            </div>
          </div>
        `).join('')}

        <div class="customizer-action-bar">
          <button class="btn btn-primary" onclick="customizer.savePhishingChanges()">
            💾 Guardar y Publicar en Base de Datos
          </button>
          <button class="btn btn-secondary" onclick="customizer.resetPhishingDefaults()">
            🔄 Restablecer Predeterminados
          </button>
        </div>
      </div>
    `;
  }

  async savePhishingChanges() {
    games.phishing.cases.forEach((c, idx) => {
      c.from = document.getElementById(`phish-from-${idx}`).value;
      c.subject = document.getElementById(`phish-subject-${idx}`).value;
      c.body = document.getElementById(`phish-body-${idx}`).value;
      c.explanation = document.getElementById(`phish-exp-${idx}`).value;
    });

    await this.syncScenariosToServer();
    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Casos de Phishing Guardados',
      message: 'Los casos de simulación de correo electrónico se han actualizado y sincronizado con éxito.',
      type: 'success'
    });
  }

  resetPhishingDefaults() {
    app.showModalConfirm({
      title: '🔄 ¿Restablecer Predeterminados?',
      message: '¿Estás seguro de que deseas restaurar los casos predeterminados de fábrica?',
      type: 'warning'
    }).then(async confirmed => {
      if (confirmed) {
        games.phishing = new PhishingGame();
        await this.syncScenariosToServer();
        app.playAudio('complete');
        this.renderEditor();
      }
    });
  }

  // --- EDITOR DE CLASIFICACIÓN DE OFICINA SEGURA (FASE 1) ---
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

  async savePciChanges() {
    games.pci.dataItems.forEach((item, idx) => {
      item.desc = document.getElementById(`pci-desc-${idx}`).value;
      item.category = document.getElementById(`pci-vault-${idx}`).value;
    });

    await this.syncScenariosToServer();
    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Configuración Guardada',
      message: 'La configuración de Oficina Segura (Escritorio Limpio) se ha sincronizado con éxito.',
      type: 'success'
    });
  }

  // --- EDITOR DEL SIMULADOR DE INCIDENTES (FASE 1) ---
  renderIncidentEditor(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--accent-red-light);">🚨 Editor de Diálogos de Ingeniería Social (Vishing)</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Modifica los textos narrativos de la aventura de Vishing y SMS.</p>
      
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

  async saveIncidentChanges() {
    Object.keys(games.incident.nodes).forEach(nodeId => {
      games.incident.nodes[nodeId].text = document.getElementById(`inc-node-text-${nodeId}`).value;
    });

    await this.syncScenariosToServer();
    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Narrativa Guardada',
      message: 'La narrativa y los diálogos de la simulación de incidentes se han guardado con éxito.',
      type: 'success'
    });
  }

  // --- EDITOR DE MÓDULOS DE FASE 2 ---
  renderPhase2Editor(container) {
    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--accent-cyan);">🚀 Editor de Escenarios — Fase 2 (Especialización Transaccional)</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Personaliza los escenarios avanzados de Fraude Ejecutivo (BEC) e IA Generativa Segura.</p>
      
      <div class="customizer-form" style="max-height:480px; overflow-y:auto; padding-right:0.5rem;">
        ${games.bec_fraud.cases.map((c, idx) => `
          <div class="sidebar-panel" style="background:rgba(255,255,255,0.01); border-color:rgba(255,255,255,0.05); margin-bottom:1rem; padding:1.2rem;">
            <h4 style="color:var(--accent-cyan); font-size:0.92rem; margin-bottom:0.6rem;">
              Fraude BEC Caso ${idx + 1}: ${c.title}
            </h4>
            <div class="input-group">
              <label>Remitente Simulado:</label>
              <input type="text" class="text-input" id="bec-edit-sender-${idx}" value="${c.sender}">
            </div>
            <div class="input-group">
              <label>Asunto:</label>
              <input type="text" class="text-input" id="bec-edit-subject-${idx}" value="${c.subject}">
            </div>
            <div class="input-group">
              <label>Descripción del Escenario:</label>
              <textarea class="text-input" id="bec-edit-desc-${idx}" style="min-height:80px; font-size:0.84rem;">${c.scenarioDesc}</textarea>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="customizer-action-bar">
        <button class="btn btn-primary" onclick="customizer.savePhase2Changes()">
          💾 Guardar Escenarios Fase 2
        </button>
      </div>
    `;
  }

  async savePhase2Changes() {
    games.bec_fraud.cases.forEach((c, idx) => {
      c.sender = document.getElementById(`bec-edit-sender-${idx}`).value;
      c.subject = document.getElementById(`bec-edit-subject-${idx}`).value;
      c.scenarioDesc = document.getElementById(`bec-edit-desc-${idx}`).value;
    });

    await this.syncScenariosToServer();
    app.playAudio('complete');
    app.showModalAlert({
      title: '💾 Escenarios Fase 2 Guardados',
      message: 'Los escenarios de la Fase 2 se han actualizado y sincronizado en PostgreSQL.',
      type: 'success'
    });
  }

  // --- EXPORTACIÓN E IMPORTACIÓN DE PLANTILLAS JSON ---
  renderImportExport(container) {
    const fullConfig = this.getFullConfigObject();
    const jsonString = JSON.stringify(fullConfig, null, 2);

    container.innerHTML = `
      <h3 style="margin-bottom:1rem; color:var(--text-main);">💾 Resguardo y Carga de Plantillas Personalizadas (Fase 1 + Fase 2)</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Copia este JSON para respaldar tus escenarios editados de Fase 1 y Fase 2, o pega una plantilla y presiona 'Importar' para actualizar toda la academia.</p>
      
      <div class="customizer-form">
        <div class="input-group">
          <label>Plantilla Completa de Entrenamiento (JSON):</label>
          <textarea class="text-input" id="json-template-area" style="min-height:280px; font-family:var(--font-mono); font-size:0.75rem; line-height:1.4; color:var(--accent-cyan);">${jsonString}</textarea>
        </div>

        <div style="display:flex; gap:1rem;">
          <button class="btn btn-success" onclick="customizer.importTemplate()" style="flex:1;">
            📥 Importar y Publicar JSON
          </button>
          <button class="btn btn-primary" onclick="customizer.downloadTemplate()" style="flex:1;">
            📤 Descargar Archivo .json
          </button>
        </div>
      </div>
    `;
  }

  async importTemplate() {
    const text = document.getElementById('json-template-area').value;
    try {
      const parsed = JSON.parse(text);
      if (parsed.phishing && parsed.pci && parsed.incident) {
        this.applyFullConfigObject(parsed);
        await this.syncScenariosToServer();

        app.playAudio('complete');
        app.showModalAlert({
          title: '📥 Plantilla Importada',
          message: '¡Plantilla importada y sincronizada con éxito! La academia se ha actualizado con tus nuevos escenarios.',
          type: 'success'
        });
      } else {
        app.showModalAlert({
          title: '❌ Error de Estructura',
          message: 'Estructura de JSON inválida. Asegúrate de incluir los nodos base de la academia.',
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
    const fullConfig = this.getFullConfigObject();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "suiche7b_cybershield_f1_f2_template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    app.playAudio('complete');
  }
}

const customizer = new TemplateCustomizer();
window.customizer = customizer;
