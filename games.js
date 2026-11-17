/**
 * Academia CiberSegura Corporación Suiche 7B - Games Data & Interaction Logic (Fase 1 + Fase 2)
 * Fase 1 (Básico): Phishing Detective, Oficina Segura, Alerta de Vishing y SMS, Fuerza Bruta, Trampas con USB.
 * Fase 2 (Especialista Transaccional): IA Generativa (Shadow AI), PCI-DSS 4.0 Transaccional,
 * Quishing & Fatiga MFA, Fraude Ejecutivo (BEC), Teletrabajo & Redes Wi-Fi (Evil Twin).
 */

/**
 * Baraja un arreglo de opciones de respuesta (Fisher-Yates) y garantiza que la posición
 * de la respuesta correcta cambie dinámicamente en cada pregunta (nunca fija en la primera opción).
 */
function shuffleOptions(options, gameInstance = null) {
  if (!Array.isArray(options) || options.length <= 1) return options ? [...options] : [];
  const cloned = options.map(opt => ({ ...opt }));

  const getCorrectIdx = (arr) =>
    arr.findIndex(o => o.isCorrect === true || (typeof o.points === 'number' && o.points > 0));

  const lastIdx = (gameInstance && typeof gameInstance._lastCorrectIdx === 'number')
    ? gameInstance._lastCorrectIdx
    : (typeof window !== 'undefined' && typeof window._lastGlobalCorrectIdx === 'number'
      ? window._lastGlobalCorrectIdx
      : 0);

  for (let attempt = 0; attempt < 12; attempt++) {
    for (let i = cloned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    const cIdx = getCorrectIdx(cloned);
    if (cIdx !== -1 && cIdx !== lastIdx) {
      break;
    }
  }

  const finalIdx = getCorrectIdx(cloned);
  if (finalIdx !== -1) {
    if (gameInstance) gameInstance._lastCorrectIdx = finalIdx;
    if (typeof window !== 'undefined') window._lastGlobalCorrectIdx = finalIdx;
  }

  return cloned;
}
window.shuffleOptions = shuffleOptions;

// ============================================================================
// FASE 1 — MÓDULO 1: PHISHING DETECTIVE
// ============================================================================
class PhishingGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.selectedClueId = null;
    this.hasAnswered = false;

    this.cases = [
      {
        id: 1,
        from: "soporte-ti@suiche7b-ve.com",
        subject: "🚨 URGENTE: Bloqueo de cuenta inminente por actualización de seguridad",
        body: `
          Estimado Colaborador de La Corporación Suiche 7B,
          <br><br>
          Hemos detectado múltiples intentos de inicio de sesión fallidos en su cuenta corporativa desde una ubicación sospechosa fuera de Venezuela. Para evitar la suspensión preventiva de su cuenta de correo y accesos administrativos, requerimos que verifique sus credenciales de inmediato.
          <br><br>
          Por favor, ingrese al portal de autogestión a través del siguiente enlace oficial e inicie sesión:
          <br>
          <a class="inspectable inspectable-link" data-clue="link_clue">http://seguridad.suiche7b-ve.com/login-portal</a>
          <br><br>
          Si no realiza esta validación en las próximas 2 horas, su cuenta será desactivada permanentemente por políticas de seguridad de la red de pagos.
          <br><br>
          Atentamente,
          <br>
          <strong>Soporte Técnico Especializado</strong>
          <br>
          <span class="inspectable" data-clue="sender_clue">Dirección Tecnología</span>
        `,
        isSafe: false,
        clues: {
          sender_clue: {
            title: "Remitente Sospechoso",
            text: "El remitente usa el dominio 'suiche7b-ve.com'. El dominio oficial de la empresa es 'suiche7b.com.ve'. Este es un dominio clonado registrado por ciberdelincuentes para suplantar la identidad corporativa.",
            isHazard: true
          },
          link_clue: {
            title: "Enlace Inseguro y Falso",
            text: "El enlace utiliza el protocolo inseguro 'http://' en lugar de 'https://' (que cifra la conexión). Además, apunta al dominio falso 'suiche7b-ve.com'. Si escribes tu contraseña allí, se la enviarás directamente al atacante.",
            isHazard: true
          }
        },
        explanation: "Este correo es una simulación clásica de <strong>Phishing con sentido de urgencia</strong>. El atacante intenta asustarte con el bloqueo de tu cuenta para que no verifiques los detalles. Las pistas clave son: 1) El dominio del remitente es falso ('suiche7b-ve.com'), y 2) El enlace no es seguro y apunta a un servidor externo malicioso."
      },
      {
        id: 2,
        from: "facturacion@cantv-ve.net",
        subject: "Cobro Administrativo: Factura Pendiente Mayo 2026 - Conexión Principal",
        body: `
          Estimado cliente de La Corporación Suiche 7B,
          <br><br>
          Le informamos que presenta un saldo vencido en su factura telefónica y de enlace dedicado empresarial correspondiente al período de Mayo 2026. A fin de evitar el corte del servicio interbancario de telecomunicaciones, solicitamos procesar el pago a la brevedad.
          <br><br>
          Adjunto en este correo encontrará el desglose detallado de los conceptos adeudados y las cuentas bancarias de destino autorizadas:
          <br><br>
          📂 <span class="inspectable" data-clue="attachment_clue" style="font-weight:700; color:var(--accent-red-light); text-decoration:underline;">factura_CANTV_mayo.zip</span> (128 KB)
          <br><br>
          Si tiene dudas, puede comunicarse con su ejecutivo de cuentas corporativas.
          <br><br>
          Saludos cordiales,
          <br>
          <strong>CANTV Empresas y Enlaces Especializados</strong>
        `,
        isSafe: false,
        clues: {
          attachment_clue: {
            title: "Archivo Adjunto Peligroso",
            text: "El archivo adjunto es un archivo comprimido '.zip'. Los atacantes usan este formato para esconder programas ejecutables maliciosos (.exe o .scr). Una factura real de un proveedor suele ser un archivo de texto o un PDF limpio, nunca un ZIP ejecutable.",
            isHazard: true
          }
        },
        explanation: "Este caso es un <strong>Phishing con Software Malicioso (Malware)</strong>. Corporación Suiche 7B maneja conexiones sensibles con proveedores. Los atacantes lo saben y envían facturas falsas. Si abres el archivo '.zip' e instalas lo que contiene, infectarás tu computadora de la oficina con virus o ransomware que podría propagarse a la red."
      },
      {
        id: 3,
        from: "talento@suiche7b.com.ve",
        subject: "Convocatoria: Simulacro Anual de Evacuación y Seguridad Física",
        body: `
          Estimado Equipo de La Corporación Suiche 7B,
          <br><br>
          Como parte de nuestros planes preventivos y normativas de Seguridad y Salud Laboral, el próximo lunes 28 de septiembre a las 10:00 AM realizaremos nuestro <strong>Simulacro Anual de Evacuación</strong> en las instalaciones de la Corporación.
          <br><br>
          La participación de todo el personal es obligatoria para validar nuestros tiempos de respuesta en contingencias.
          <br><br>
          Para registrar su asistencia previa y conocer los puntos de encuentro seguros asignados a su piso, por favor ingrese a nuestro portal interno HTTPS de autogestión:
          <br>
          <a class="inspectable inspectable-link" data-clue="legit_link">https://portal.suiche7b.com.ve/simulacro-evacuacion</a>
          <br><br>
          Agradecemos su colaboración continua para mantener un espacio laboral seguro.
          <br><br>
          Saludos,
          <br>
          <strong>Gerencia Capital Humano</strong>
        `,
        isSafe: true,
        clues: {
          legit_link: {
            title: "Enlace Interno Legítimo",
            text: "El enlace utiliza una conexión segura 'https://' y apunta exactamente al subdominio 'portal.suiche7b.com.ve', que pertenece a los servidores oficiales autorizados de la empresa. No hay anomalías en el enlace.",
            isHazard: false
          }
        },
        explanation: "Este correo es <strong>SEGURO</strong>. Es una comunicación interna estándar de Gerencia Capital Humano. El remitente utiliza el dominio real de la empresa ('@suiche7b.com.ve'), no genera pánico irracional y el enlace dirige a la intranet segura mediante HTTPS."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.selectedClueId = null;

    document.getElementById('phishing-feedback').style.display = 'none';
    document.getElementById('phishing-actions').style.display = 'flex';

    this.renderCase();
  }

  renderCase() {
    this.hasAnswered = false;
    this.selectedClueId = null;

    const currentCase = this.cases[this.currentCaseIndex];

    document.getElementById('phishing-case-index').textContent = this.currentCaseIndex + 1;
    document.getElementById('phishing-case-total').textContent = this.cases.length;

    document.getElementById('email-from').textContent = currentCase.from;
    document.getElementById('email-subject').textContent = currentCase.subject;
    document.getElementById('email-body-content').innerHTML = currentCase.body;

    document.getElementById('phishing-feedback').style.display = 'none';
    document.getElementById('phishing-actions').style.display = 'flex';

    document.getElementById('clue-title-text').textContent = '🔬 Lupa de Hacking Ético';
    document.getElementById('clue-desc-text').textContent = 'Haz clic sobre los elementos subrayados en azul en el correo para analizarlos y buscar anomalías.';
    document.getElementById('clue-display-card').className = 'current-clue-card';

    const inspectables = document.querySelectorAll('#phishing-view .inspectable');
    inspectables.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectClue(el.getAttribute('data-clue'));
      });
    });
  }

  selectClue(clueId) {
    if (!clueId) return;

    const currentCase = this.cases[this.currentCaseIndex];
    const clue = currentCase.clues && currentCase.clues[clueId];
    if (!clue) return;

    app.playAudio('click');
    this.selectedClueId = clueId;

    const titleEl = document.getElementById('clue-title-text');
    const descEl = document.getElementById('clue-desc-text');
    const card = document.getElementById('clue-display-card');

    titleEl.textContent = clue.title;
    descEl.textContent = clue.text;

    if (clue.isHazard) {
      card.className = 'current-clue-card hazard';
      titleEl.classList.add('hazard');
    } else {
      card.className = 'current-clue-card';
      titleEl.classList.remove('hazard');
    }
  }

  makeDecision(userMarkedSafe) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const currentCase = this.cases[this.currentCaseIndex];
    const isCorrect = (userMarkedSafe === currentCase.isSafe);

    document.getElementById('phishing-actions').style.display = 'none';
    const feedbackOverlay = document.getElementById('phishing-feedback');
    feedbackOverlay.style.display = 'block';

    const statusEl = document.getElementById('phishing-feedback-status');
    const descEl = document.getElementById('phishing-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'phishing');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ¡Excelente Decisión! (+50 PTS)
      `;
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'phishing');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Decisión de Riesgo (0 PTS)
      `;
    }

    descEl.innerHTML = `
      <p style="margin-bottom:0.8rem; font-weight:600; color:white;">¿Por qué?</p>
      ${currentCase.explanation}
    `;

    const nextBtn = document.getElementById('phishing-next-btn');
    if (this.currentCaseIndex === this.cases.length - 1) {
      nextBtn.textContent = 'Finalizar Módulo';
    } else {
      nextBtn.textContent = 'Siguiente Caso →';
    }
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      app.markModuleCompleted('phishing');
      app.showModalAlert({
        title: '🏆 Módulo Phishing Detective Completado',
        message: '¡Excelente trabajo! Has analizado todos los correos del simulador con éxito. Has aprendido a identificar dominios suplantados, enlaces dudosos y archivos adjuntos peligrosos en la red de La Corporación Suiche 7B.',
        type: 'success'
      }).then(() => {
        app.navigateTo('dashboard');
      });
    }
  }
}

// ============================================================================
// FASE 1 — MÓDULO 2: OFICINA SEGURA (CLEAN DESK & CLEAR SCREEN)
// ============================================================================
class PciGame {
  constructor() {
    this.dataItems = [
      {
        id: 'lockpc',
        name: 'Bloqueo de Pantalla (Win + L)',
        desc: 'Bloquear la sesión de la computadora inmediatamente al levantarse o alejarse del puesto de trabajo.',
        category: 'safe',
        wrongTitle: '💡 Consejo: Bloqueo de Pantalla',
        wrongMessage: '¡Atención! Bloquear tu computadora con <strong>Win + L</strong> al ausentarte de tu escritorio NO es una infracción; es una <strong>Buena Práctica Obligatoria (Clear Screen)</strong> en Corporación Suiche 7B para evitar que curiosos o terceros manipulen tu sesión abierta.'
      },
      {
        id: 'postit',
        name: 'Post-it con Contraseña en el Monitor',
        desc: 'Pegar notas adhesivas con contraseñas o claves de acceso en el marco de la pantalla, teclado o escritorio.',
        category: 'forbidden',
        wrongTitle: '⚠️ Riesgo: Contraseñas a la Vista',
        wrongMessage: '¡Cuidado! Anotar contraseñas en post-its visibles es una <strong>Infracción Grave</strong> a la Política de Escritorio Limpio. Cualquier persona que transite por tu puesto puede copiarlas y vulnerar los sistemas.'
      },
      {
        id: 'idcard',
        name: 'Carnet de Acceso en el Escritorio',
        desc: 'Dejar el carnet institucional y la tarjeta de proximidad desatendidos sobre la mesa al salir a almorzar.',
        category: 'forbidden',
        wrongTitle: '⚠️ Riesgo: Credencial Desatendida',
        wrongMessage: '¡Atención! Dejar tu carnet institucional sobre la mesa es una <strong>Infracción de Seguridad Física</strong>. Tu carnet es personal e intransferible; un tercero podría usarlo para ingresar a áreas restringidas.'
      },
      {
        id: 'shredder',
        name: 'Triturado de Documentos en Papel',
        desc: 'Destruir en la máquina trituradora los reportes impresos, minutas y papeles de trabajo que ya no se utilicen.',
        category: 'safe',
        wrongTitle: '💡 Consejo: Destrucción Segura',
        wrongMessage: '¡Atención! Triturar documentos con información interna NO es una infracción; es una <strong>Buena Práctica Obligatoria</strong> de Escritorio Limpio para evitar la fuga de datos confidenciales.'
      },
      {
        id: 'usbunknown',
        name: 'Conectar USB Encontrado',
        desc: 'Insertar un pendrive o dispositivo USB ajeno en la laptop corporativa para averiguar de quién es.',
        category: 'forbidden',
        wrongTitle: '⚠️ Riesgo: Ataque por USB (Baiting)',
        wrongMessage: '¡Peligro! Conectar una memoria USB encontrada en tu computadora de trabajo es una <strong>Infracción de Alto Riesgo</strong>. Puede contener malware o scripts automatizados (BadUSB).'
      },
      {
        id: 'lockdrawer',
        name: 'Guardar Carpetas y Documentos Bajo Llave',
        desc: 'Archivar expedientes, libretas de notas, contratos y tokens de acceso en gavetas con llave al ausentarse o terminar la jornada.',
        category: 'safe',
        wrongTitle: '💡 Consejo: Resguardo Físico',
        wrongMessage: '¡Atención! Guardar documentos bajo llave al ausentarte NO es una infracción; es la esencia de la <strong>Política de Escritorio Limpio (Clean Desk)</strong>.'
      },
      {
        id: 'printleft',
        name: 'Reportes Olvidados en la Impresora',
        desc: 'Enviar a imprimir listados o documentos con datos corporativos y dejarlos desatendidos en la bandeja de la impresora.',
        category: 'forbidden',
        wrongTitle: '⚠️ Riesgo: Impresiones Abandonadas',
        wrongMessage: '¡Cuidado! Dejar documentos en la bandeja de una impresora compartida es una <strong>Infracción Física</strong>. Siempre debes retirar las hojas inmediatamente.'
      },
      {
        id: 'cleandesk_endday',
        name: 'Mesa Despejada al Finalizar la Jornada',
        desc: 'Dejar la superficie del escritorio completamente libre de papeles confidenciales, sellos húmedos y medios extraíbles al salir.',
        category: 'safe',
        wrongTitle: '💡 Consejo: Mesa Despejada',
        wrongMessage: '¡Atención! Dejar el escritorio despejado y ordenado al retirarse es una <strong>Buena Práctica Indispensable</strong> de la Política de Escritorio Limpio en Corporación Suiche 7B.'
      }
    ];
    this.placedCount = 0;
  }

  init() {
    this.placedCount = 0;
    document.getElementById('vault-safe-items').innerHTML = '';
    document.getElementById('vault-forbidden-items').innerHTML = '';
    document.getElementById('pci-completion-feedback').style.display = 'none';
    document.getElementById('pci-items-list').style.display = 'grid';

    this.renderItems();
  }

  renderItems() {
    const list = document.getElementById('pci-items-list');
    list.innerHTML = '';

    const shuffledItems = [...this.dataItems];
    for (let i = shuffledItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledItems[i], shuffledItems[j]] = [shuffledItems[j], shuffledItems[i]];
    }

    shuffledItems.forEach(item => {
      list.innerHTML += `
        <div class="pci-data-card" id="pci-card-${item.id}" draggable="true" ondragstart="games.pci.handleDragStart(event, '${item.id}')">
          <div class="pci-data-desc">
            <span class="pci-data-title">${item.name}</span>
            <span class="pci-data-hint">${item.desc}</span>
          </div>
          <div style="display:flex; gap:0.4rem; margin-top:0.6rem;">
            <button class="btn btn-secondary" style="padding:0.3rem 0.5rem; font-size:0.7rem; flex:1;" onclick="games.pci.moveItem('${item.id}', 'safe')" title="Mover a Bóveda Segura">🟢 Segura</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.5rem; font-size:0.7rem; flex:1;" onclick="games.pci.moveItem('${item.id}', 'forbidden')" title="Mover a Prohibida">🔴 Infracción</button>
          </div>
        </div>
      `;
    });
  }

  handleDragStart(event, itemId) {
    event.dataTransfer.setData('text/plain', itemId);
    app.playAudio('click');
  }

  allowDrop(event) {
    event.preventDefault();
    const vault = event.currentTarget;
    vault.classList.add('dragover');
  }

  handleDrop(event, targetVaultId) {
    event.preventDefault();
    const vault = event.currentTarget;
    vault.classList.remove('dragover');

    const itemId = event.dataTransfer.getData('text/plain');
    if (itemId) {
      this.moveItem(itemId, targetVaultId);
    }
  }

  moveItem(itemId, targetVaultId) {
    const item = this.dataItems.find(i => i.id === itemId);
    const card = document.getElementById(`pci-card-${itemId}`);

    if (!item || !card) return;

    const isCorrect = (item.category === targetVaultId);
    card.remove();

    const vaultContainer = document.getElementById(`vault-${targetVaultId}-items`);
    const statusIcon = isCorrect ? '✅' : '❌';
    const tagClass = isCorrect ? 'style="border-color:rgba(57,255,20,0.3);"' : 'style="border-color:rgba(214,26,39,0.3);"';

    vaultContainer.innerHTML += `
      <div class="dropped-tag" ${tagClass} title="${isCorrect ? 'Clasificación correcta' : 'Clasificación incorrecta'}">
        <span>${statusIcon} ${item.name}</span>
      </div>
    `;

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(20, true, 'pci');
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'pci');

      const modalType = (item.category === 'safe') ? 'info' : 'danger';
      app.showModalAlert({
        title: item.wrongTitle || 'Aviso de Seguridad',
        message: item.wrongMessage || `La clasificación de <strong>"${item.name}"</strong> fue incorrecta.<br><br>${item.desc}`,
        type: modalType
      });
    }

    this.placedCount++;

    if (this.placedCount === this.dataItems.length) {
      this.finishGame();
    }
  }

  finishGame() {
    app.playAudio('complete');
    app.markModuleCompleted('pci');

    document.getElementById('pci-items-list').style.display = 'none';
    const feedback = document.getElementById('pci-completion-feedback');
    feedback.style.display = 'block';

    document.getElementById('pci-completion-text').innerHTML = `
      Has clasificado todos los hábitos físicos de escritorio con éxito.
      <br><br>
      <strong>Lección Aprendida sobre Escritorio Limpio (Clean Desk & Clear Screen):</strong> 
      En <strong>Corporación Suiche 7B</strong>, la ciberseguridad empieza en nuestro espacio físico de trabajo. Triturar documentos sensibles, no anotar claves en post-its, guardar el carnet de acceso, mantener gavetas bajo llave y bloquear la computadora con <strong>Win + L</strong> de inmediato previenen el espionaje de pasillo y fugas de datos.
    `;
  }
}

// ============================================================================
// FASE 1 — MÓDULO 3: ALERTA DE VISHING Y SMS
// ============================================================================
class IncidentGame {
  constructor() {
    this.metrics = {
      integrity: 100,
      trust: 100,
      uptime: 100
    };

    this.nodes = {
      start: {
        text: "Es un viernes por la tarde en Corporación Suiche 7B. Recibes un mensaje de WhatsApp urgente de un número con el Logo corporativo: 'Hola, soy Carlos de Plataforma TI. Hacemos mantenimiento imprevisto del Suiche Transaccional de la Corporación Suiche 7B. Te llegó un SMS de 6 dígitos para validar tu perfil, por favor reenvíamelo rápido para no suspender tus accesos hoy'. ¿Qué haces?",
        logs: [
          "14:15:02 - CANAL:: Chat entrante no verificado en WhatsApp Corporativo.",
          "14:15:20 - SISTEMA:: Código de verificación de un solo uso (OTP) enviado por SMS."
        ],
        options: [
          {
            text: "No compartir el código. Cortar comunicación y reportar de inmediato a la Gerencia Seguridad de la Información.",
            next: "vishing_call",
            points: 40,
            impact: { integrity: 0, trust: 0, uptime: 0 }
          },
          {
            text: "Darle el código SMS de 6 dígitos de inmediato para cooperar con el mantenimiento corporativo.",
            next: "whatsapp_hacked",
            points: 0,
            impact: { integrity: -40, trust: -20, uptime: -30 }
          }
        ]
      },
      whatsapp_hacked: {
        text: "¡Alerta Crítica! Al entregar el código SMS, el atacante ha clonado tu cuenta de WhatsApp corporativa. Ahora la usa para escribir a tus compañeros pidiéndoles transferencias bancarias de emergencia y claves de accesos a tu nombre. De repente, suena tu teléfono y una voz femenina se identifica como 'Directora de Finanzas'. ¿Qué haces?",
        logs: [
          "14:17:15 - ALERTA:: Acceso no autorizado detectado en WhatsApp Web externo.",
          "14:17:50 - MONITOREO:: Campaña de mensajería masiva de fraude iniciada desde tu número."
        ],
        options: [
          {
            text: "Colgar inmediatamente la llamada telefónica y alertar a la Gerencia Seguridad de la Información y a tus compañeros de que tu cuenta fue comprometida.",
            next: "phone_extortion",
            points: 30,
            impact: { trust: -10, uptime: -10 }
          },
          {
            text: "Seguir las instrucciones telefónicas de la supuesta Directora de Finanzas de transferir fondos corporativos para 'controlar la contingencia'.",
            next: "total_crisis",
            points: 0,
            impact: { integrity: -50, trust: -30, uptime: -20 }
          }
        ]
      },
      vishing_call: {
        text: "¡Excelente reflejo! Neutralizaste el hackeo del WhatsApp. Sin embargo, a los 5 minutos suena el teléfono fijo de tu oficina. Una voz profesional te dice: 'Hola, habla el Oficial de Cumplimiento de La Corporación Suiche 7B. Estamos en medio de una auditoría extraordinaria y sorpresa de SUDEBAN. Léame las credenciales administrativas o los datos al reverso de su carnet de acceso físico para validar su perfil'. ¿Cuál es tu postura?",
        logs: [
          "14:18:22 - CANAL:: Llamada de voz externa entrante a teléfono fijo.",
          "14:18:40 - SISTEMA:: Monitoreo preventivo del canal de soporte fijo activo."
        ],
        options: [
          {
            text: "Rechazar dar cualquier clave o datos del carnet de acceso por teléfono. Solicitarle su extensión interna e informar a la Gerencia Seguridad de la Información.",
            next: "win_secure",
            points: 40,
            impact: { integrity: 0, trust: 0, uptime: 0 }
          },
          {
            text: "Darle la contraseña e información del carnet para evitar que sancionen a Corporación Suiche 7B y cooperar con SUDEBAN.",
            next: "vishing_compromise",
            points: 0,
            impact: { integrity: -30, trust: -20, uptime: -10 }
          }
        ]
      },
      phone_extortion: {
        text: "El atacante se da cuenta de que intentas reportarlo. Tu celular timbra con amenazas: 'Sabemos quién eres, cooperas enviándonos una clave administrativa temporal de La Corporación Suiche 7B o bloquearemos definitivamente todas tus credenciales'. ¿Qué haces?",
        logs: [
          "14:20:11 - SEGURIDAD:: Canal de extorsión activo en telefonía móvil.",
          "14:20:40 - ALERTA:: Intento de amedrentamiento psicológico detectado."
        ],
        options: [
          {
            text: "Mantener la calma, colgar la llamada y reportarlo formalmente de inmediato a la Gerencia Seguridad de la Información.",
            next: "win_mitigated",
            points: 30,
            impact: { integrity: 5, trust: 10, uptime: 0 }
          },
          {
            text: "Entrar en pánico y darles una contraseña temporal para que te dejen tranquilo.",
            next: "total_crisis",
            points: 0,
            impact: { integrity: -50, trust: -30, uptime: -30 }
          }
        ]
      },
      vishing_compromise: {
        text: "¡Falla grave! Los datos que entregaste eran para un atacante de Vishing (ingeniería social telefónica). Tus credenciales ya no funcionan y tus compañeros informan que hay transferencias sospechosas en proceso. ¿Cuál es tu respuesta de urgencia?",
        logs: [
          "14:22:12 - CRÍTICO:: Cambio de credencial no autorizado en el portal administrativo.",
          "14:22:35 - ALERTA:: Transacciones transfronterizas anómalas iniciadas."
        ],
        options: [
          {
            text: "Llamar urgentemente a Seguridad de la Información para realizar los cambios de contraseña necesarios.",
            next: "win_mitigated",
            points: 30,
            impact: { integrity: 10, trust: 10, uptime: 0 }
          },
          {
            text: "Quedarte callado por temor al despido o amonestaciones y esperar a que el sistema se normalice solo.",
            next: "total_crisis",
            points: 0,
            impact: { integrity: -50, trust: -50, uptime: -40 }
          }
        ]
      },
      win_secure: {
        text: "¡Felicidades! Has defendido la infraestructura de La Corporación Suiche 7B con éxito absoluto. Al identificar que Plataforma TI oficial jamás solicita códigos SMS, contraseñas ni datos magnéticos de carnet por canales informales, has evitado una brecha crítica.",
        logs: [
          "14:25:00 - OK:: Monitoreo del switch de transacciones estable al 100%.",
          "14:25:20 - REPORTE:: Número telefónico del estafador boletinado al CISO corporativo."
        ],
        options: [
          {
            text: "Finalizar Módulo y Emitir Reporte",
            next: "end_perfect",
            points: 0,
            impact: {}
          }
        ]
      },
      win_mitigated: {
        text: "Mitigación Exitosa. Aunque caíste en la trampa inicial del estafador, tu reporte veloz de seguridad a las gerencias centrales permitió bloquear oportunamente tus perfiles de red del Suiche Transaccional antes de que se concretaran transacciones.",
        logs: [
          "14:28:10 - MITIGADO:: Intrusión bloqueada a nivel de firewall corporativo.",
          "14:28:40 - SISTEMA:: Credenciales obsoletas desactivadas exitosamente."
        ],
        options: [
          {
            text: "Finalizar Módulo y Emitir Reporte",
            next: "end_recovery",
            points: 0,
            impact: {}
          }
        ]
      },
      total_crisis: {
        text: "Desastre. Has cedido por completo ante la ingeniería social. El atacante obtuvo acceso al Suiche Transaccional de la Corporación, comprometiendo la disponibilidad del servicio. La Gerencia Seguridad de la Información activó el protocolo de respuesta a incidentes.",
        logs: [
          "14:35:12 - ERROR:: Pérdida de integridad de accesos en el núcleo central.",
          "14:38:00 - CRÍTICO:: Fuga masiva de confianza en las transacciones interbancarias."
        ],
        options: [
          {
            text: "Finalizar Módulo con Puntuación de Crisis",
            next: "end_fail",
            points: 0,
            impact: {}
          }
        ]
      }
    };

    this.currentNodeId = 'start';
  }

  init() {
    this.metrics = { integrity: 100, trust: 100, uptime: 100 };
    this.currentNodeId = 'start';

    document.getElementById('incident-terminal-logs').innerHTML = '';
    this.updateMetricsUI();
    this.renderNode();
  }

  updateMetricsUI() {
    const intFill = document.getElementById('metric-integrity-fill');
    const trFill = document.getElementById('metric-trust-fill');
    const upFill = document.getElementById('metric-uptime-fill');

    document.getElementById('metric-integrity-text').textContent = `${this.metrics.integrity}%`;
    document.getElementById('metric-trust-text').textContent = `${this.metrics.trust}%`;
    document.getElementById('metric-uptime-text').textContent = `${this.metrics.uptime}%`;

    intFill.style.width = `${this.metrics.integrity}%`;
    trFill.style.width = `${this.metrics.trust}%`;
    upFill.style.width = `${this.metrics.uptime}%`;

    this.setMetricColor(intFill, this.metrics.integrity);
    this.setMetricColor(trFill, this.metrics.trust);
    this.setMetricColor(upFill, this.metrics.uptime);
  }

  setMetricColor(element, value) {
    if (value >= 75) {
      element.style.background = 'var(--accent-green)';
    } else if (value >= 40) {
      element.style.background = '#fbba0a';
    } else {
      element.style.background = 'var(--accent-red-light)';
    }
  }

  renderNode() {
    const node = this.nodes[this.currentNodeId];
    if (!node) return;

    const terminal = document.getElementById('incident-terminal-logs');

    node.logs.forEach(log => {
      let tagClass = 'tag-system';
      let tagText = 'SISTEMA';

      if (log.includes('ALERTA') || log.includes('CRÍTICO')) {
        tagClass = 'tag-alert';
        tagText = 'ALERTA';
      }

      const logRow = document.createElement('div');
      logRow.className = 'terminal-log-row';
      logRow.innerHTML = `
        <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
        <span class="log-tag ${tagClass}">${tagText}</span>
        <span>${log}</span>
      `;
      terminal.appendChild(logRow);
    });

    terminal.scrollTop = terminal.scrollHeight;
    document.getElementById('incident-story-desc').textContent = node.text;

    const optionsContainer = document.getElementById('incident-options-list');
    optionsContainer.innerHTML = '';

    this.currentOptions = shuffleOptions(node.options, this);
    this.currentOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'story-option-btn';
      btn.innerHTML = `
        <span class="story-option-num">${idx + 1}</span>
        <span>${opt.text}</span>
      `;
      btn.onclick = () => this.makeChoice(opt);
      optionsContainer.appendChild(btn);
    });
  }

  makeChoice(option) {
    app.playAudio('click');

    if (option.points > 0) {
      app.addPoints(option.points, true, 'incident');
    } else if (option.next && !option.next.startsWith('end_')) {
      app.addPoints(0, false, 'incident');
    }

    if (option.impact) {
      this.metrics.integrity = Math.max(0, Math.min(100, this.metrics.integrity + (option.impact.integrity || 0)));
      this.metrics.trust = Math.max(0, Math.min(100, this.metrics.trust + (option.impact.trust || 0)));
      this.metrics.uptime = Math.max(0, Math.min(100, this.metrics.uptime + (option.impact.uptime || 0)));

      if (option.impact.integrity < 0 || option.impact.trust < 0 || option.impact.uptime < 0) {
        app.playAudio('incident_alert');
      } else {
        app.playAudio('correct');
      }
    }

    this.updateMetricsUI();
    this.currentNodeId = option.next;

    if (this.currentNodeId.startsWith('end_')) {
      this.finishGame(this.currentNodeId);
    } else {
      this.renderNode();
    }
  }

  finishGame(endNodeId) {
    app.playAudio('complete');
    app.markModuleCompleted('incident');

    let title = '';
    let description = '';

    switch (endNodeId) {
      case 'end_perfect':
        title = '🛡️ Escudo de Ingeniería Social';
        description = '¡Excelente! Mantuviste la confidencialidad absoluta al no divulgar claves ni SMS de un solo uso por llamadas o chats no oficiales.';
        break;
      case 'end_recovery':
        title = '⚠️ Contención Post-Incidente';
        description = 'Caíste en los trucos telefónicos corporativos inicialmente, pero tu reporte veloz detuvo fuga de información o desvío de fondos a tiempo.';
        break;
      case 'end_fail':
        title = '❌ Brecha en Ingeniería Social';
        description = 'Las decisiones que tomaste permitieron el control absoluto de tus perfiles a cibercriminales. ¡Esta simulación demuestra que las claves NUNCA se entregan!';
        break;
    }

    let type = 'success';
    if (endNodeId === 'end_fail') type = 'danger';
    else if (endNodeId === 'end_recovery') type = 'warning';

    app.showModalAlert({
      title: '📞 Simulación de Incidente Finalizada',
      message: `<strong>${title}</strong><br><br>${description}`,
      type: type
    }).then(() => {
      app.navigateTo('dashboard');
    });
  }
}

// ============================================================================
// FASE 1 — MÓDULO 4: SIMULADOR DE FUERZA BRUTA (CONTRASEÑAS)
// ============================================================================
class PasswordGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.matrixSpeed = 1;
    this.columns = [];
    this.fontSize = 12;
    this.lastStateSafe = false;
  }

  init() {
    this.canvas = document.getElementById('cracking-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.initMatrix();
      this.startMatrixAnimation();
    }

    document.getElementById('test-password').value = '';
    this.evaluatePassword('');

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight || 200;
  }

  initMatrix() {
    const cols = Math.floor(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let i = 0; i < cols; i++) {
      this.columns.push({
        x: i * this.fontSize,
        y: Math.random() * -100,
        speed: 1 + Math.random() * 3
      });
    }
  }

  startMatrixAnimation() {
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const draw = () => {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#fbba0a';
      this.ctx.font = `${this.fontSize}px monospace`;

      this.columns.forEach(col => {
        const char = Math.random() > 0.5 ? '1' : '0';
        this.ctx.fillText(char, col.x, col.y);

        col.y += col.speed * this.matrixSpeed;

        if (col.y > this.canvas.height) {
          col.y = -20;
          col.speed = 1 + Math.random() * 3;
        }
      });

      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }

  evaluatePassword(pwd) {
    const rules = {
      length: pwd.length >= 10,
      upper: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      symbol: /[$@#%!*?&._-]/.test(pwd)
    };

    this.updateRuleUI('rule-length', rules.length);
    this.updateRuleUI('rule-upper', rules.upper);
    this.updateRuleUI('rule-number', rules.number);
    this.updateRuleUI('rule-symbol', rules.symbol);

    // Actualizar anillos 3D de la Bóveda Criptográfica
    const ringMap = [
      { id: 'vault-ring-1', ok: rules.length },
      { id: 'vault-ring-2', ok: rules.upper },
      { id: 'vault-ring-3', ok: rules.number },
      { id: 'vault-ring-4', ok: rules.symbol }
    ];
    ringMap.forEach(r => {
      const rEl = document.getElementById(r.id);
      if (rEl) {
        if (r.ok) rEl.classList.add('ring-locked');
        else rEl.classList.remove('ring-locked');
      }
    });
    const lockIcon = document.getElementById('vault-lock-icon');
    const metCount = Object.values(rules).filter(Boolean).length;
    if (lockIcon) {
      lockIcon.textContent = metCount === 4 ? '🔒' : '🔓';
    }

    const strengthText = document.getElementById('password-strength-text');
    const bars = [
      document.getElementById('strength-bar-1'),
      document.getElementById('strength-bar-2'),
      document.getElementById('strength-bar-3'),
      document.getElementById('strength-bar-4')
    ];

    bars.forEach(b => {
      b.style.background = 'rgba(255,255,255,0.05)';
    });

    let timeText = 'Instante (Fuerza Bruta Directa) ❌';
    let statusText = '[ESTADO]: Contraseña extremadamente vulnerable a cracking.';
    this.matrixSpeed = 5;

    if (pwd.length === 0) {
      strengthText.textContent = 'Vacía';
      strengthText.style.color = 'var(--text-muted)';
      timeText = 'Esperando clave...';
      statusText = '[ESTADO]: Esperando credencial de prueba...';
      this.matrixSpeed = 1;
    } else if (metCount === 1) {
      strengthText.textContent = 'Muy Débil ❌';
      strengthText.style.color = 'var(--accent-red-light)';
      bars[0].style.background = 'var(--accent-red-light)';
      timeText = 'Menos de 1 segundo ❌';
      statusText = '[ESTADO]: Un ciberdelincuente descifra esta clave en milisegundos.';
      this.matrixSpeed = 4;
    } else if (metCount === 2) {
      strengthText.textContent = 'Débil ⚠️';
      strengthText.style.color = '#fbba0a';
      bars[0].style.background = '#fbba0a';
      bars[1].style.background = '#fbba0a';
      timeText = '2 minutos ⚠️';
      statusText = '[ESTADO]: Fuerza bruta exitosa usando un diccionario de palabras común.';
      this.matrixSpeed = 2.5;
    } else if (metCount === 3) {
      strengthText.textContent = 'Media 🟡';
      strengthText.style.color = '#eab308';
      bars[0].style.background = '#eab308';
      bars[1].style.background = '#eab308';
      bars[2].style.background = '#eab308';
      timeText = '4 semanas 📅';
      statusText = '[ESTADO]: Contraseña moderada. Dificulta los ataques automatizados.';
      this.matrixSpeed = 1.2;
    } else if (metCount === 4) {
      strengthText.textContent = 'Segura y Fuerte 🏆';
      strengthText.style.color = 'var(--accent-green)';
      bars[0].style.background = 'var(--accent-green)';
      bars[1].style.background = 'var(--accent-green)';
      bars[2].style.background = 'var(--accent-green)';
      bars[3].style.background = 'var(--accent-green)';
      timeText = '300 Años (Inquebrantable) 🏆';
      statusText = '[ESTADO]: ¡IMPERMEABLE! Complejidad excelente contra supercomputadoras.';
      this.matrixSpeed = 0.2;
    }

    document.getElementById('cracking-time-value').textContent = timeText;
    document.getElementById('cracking-status-log').textContent = statusText;

    const finishBtn = document.getElementById('password-finish-btn');
    if (metCount === 4) {
      finishBtn.disabled = false;
      if (!this.lastStateSafe) {
        app.playAudio('correct');
        this.lastStateSafe = true;
      }
    } else {
      finishBtn.disabled = true;
      this.lastStateSafe = false;
    }
  }

  updateRuleUI(id, isMet) {
    const el = document.getElementById(id);
    if (el) {
      if (isMet) {
        el.innerHTML = `<span>🟢</span> ${el.textContent.substring(2)}`;
        el.style.color = 'var(--accent-green)';
      } else {
        el.innerHTML = `<span>❌</span> ${el.textContent.substring(2)}`;
        el.style.color = 'var(--text-muted)';
      }
    }
  }

  finishModule() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    app.playAudio('complete');
    app.addPoints(100, true, 'password');
    app.markModuleCompleted('password');
    app.showModalAlert({
      title: '🔑 Fortalecimiento de Clave Completado',
      message: '¡Excelente! Has configurado una contraseña robusta e inquebrantable de prueba. Recuerda aplicar estas mismas reglas de complejidad en todas tus credenciales oficiales de La Corporación Suiche 7B.',
      type: 'success'
    }).then(() => {
      app.navigateTo('dashboard');
    });
  }
}

// ============================================================================
// FASE 1 — MÓDULO 5: TRAMPAS CON USB Y DISPOSITIVOS (BAITING)
// ============================================================================
class UsbGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        scenarioTitle: "Pendrive 'Nómina Corporación Suiche 7B' en el Pasillo",
        speech: "\"Vas caminando por el pasillo hacia la cocina o el ascensor y ves tirada en el suelo una memoria USB nueva de 64GB etiquetada con marcador: 'Nómina_Corporación Suiche 7B_2026.xlsx'. No hay nadie cerca en ese momento.\"",
        item: {
          image: "img/pendrive.png",
          name: "Pendrive 'Nómina 2026'",
          location: "Pasillo Principal / Ascensores"
        },
        options: [
          { text: "Entregarla de inmediato a la Gerencia de Seguridad de la Información sin conectarla", isCorrect: true },
          { text: "Insertarla en tu computador Corporativo para abrir el archivo y buscar el dueño", isCorrect: false },
          { text: "Formatear la memoria USB en tu computador Corporativo para usarla como almacenamiento personal", isCorrect: false }
        ],
        explanation: "Las memorias USB caídas en pasillos, estacionamientos o baños suelen ser un ataque de <strong>Ingeniería Social llamado Baiting (Cebado)</strong>. Al insertar el pendrive, scripts maliciosos automáticos (BadUSB) infectan la computadora y la red corporativa de La Corporación Suiche 7B sin que te des cuenta."
      },
      {
        scenarioTitle: "Visitante pidiendo Cargar Celular/PowerBank por USB",
        speech: "\"Un visitante o proveedor externo en una sala de reuniones te dice: 'Disculpa, se me apagó el teléfono y espero una llamada urgente de trabajo. ¿Podrías dejarme conectar mi cable USB a tu computadora de la oficina solo 10 minutos para cargarlo?'\"",
        item: {
          icon: "📱",
          name: "Smartphone / Cable USB Desconocido",
          location: "Sala de Reuniones"
        },
        options: [
          { text: "Indicarle amablemente un tomacorriente de pared y negarle la conexión a tu puerto USB", isCorrect: true },
          { text: "Permitirle conectar su celular en tu computador Corporativo mientras vigilas la pantalla", isCorrect: false },
          { text: "Prestarle tu computador Corporativo para que transfiera fotos de su trabajo", isCorrect: false }
        ],
        explanation: "Los teléfonos inteligentes y cables USB modificados (O.MG Cables) pueden ejecutar transferencia de archivos y scripts de exfiltración de datos en el momento en que se conectan a un puerto USB corporativo."
      },
      {
        scenarioTitle: "Disco Duro Externo Olvidado en Sala de Juntas",
        speech: "\"Al finalizar una reunión con un equipo multidisciplinario, notas que alguien dejó olvidado un disco duro externo sin ningún nombre ni etiqueta sobre la mesa.\"",
        item: {
          image: "img/disco_duro.png",
          name: "Disco Duro Externo Sin Etiqueta",
          location: "Mesa de Reuniones"
        },
        options: [
          { text: "Notificar a la Gerencia de Seguridad de la Información / Plataforma TI para su resguardo", isCorrect: true },
          { text: "Conectarlo en tu computador Corporativo para explorar sus carpetas e identificar a quién pertenece", isCorrect: false },
          { text: "Llevarte el disco duro a tu casa para probarlo en tu computadora personal", isCorrect: false }
        ],
        explanation: "Nunca debemos inspeccionar archivos de dispositivos de almacenamiento desconocidos por nuestra cuenta. La Gerencia de Seguridad de la Información cuenta con entornos aislados (Sandbox) para analizar la integridad de estos dispositivos."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    document.getElementById('usb-feedback').style.display = 'none';
    this.renderCase();
  }

  renderCase() {
    this.hasAnswered = false;
    const currentCase = this.cases[this.currentCaseIndex];

    document.getElementById('usb-case-counter').textContent = `Caso ${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('usb-scenario-title').textContent = currentCase.scenarioTitle;
    document.getElementById('usb-scenario-desc').textContent = currentCase.speech;

    const iconContainer = document.getElementById('usb-item-icon');
    if (currentCase.item.image) {
      iconContainer.innerHTML = `<img src="${currentCase.item.image}" alt="${currentCase.item.name}" style="width:76px; height:76px; object-fit:contain; filter:drop-shadow(0 4px 10px rgba(0, 229, 255, 0.35)); display:inline-block; vertical-align:middle;">`;
    } else {
      iconContainer.innerHTML = currentCase.item.icon || '🔌';
    }

    document.getElementById('usb-item-name').textContent = currentCase.item.name;
    document.getElementById('usb-item-location').textContent = `Ubicación: ${currentCase.item.location}`;

    const container = document.getElementById('usb-options-container');
    container.innerHTML = '';

    this.currentOptions = shuffleOptions(currentCase.options, this);
    const letters = ['A', 'B', 'C'];
    this.currentOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.75rem 1rem';
      btn.style.lineHeight = '1.4';
      btn.style.fontSize = '0.85rem';
      btn.textContent = `${letters[idx] || idx + 1}) ${opt.text}`;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('usb-feedback').style.display = 'none';
  }

  makeDecision(optionIdx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const currentCase = this.cases[this.currentCaseIndex];
    const optionsList = this.currentOptions || currentCase.options;
    const selectedOption = optionsList[optionIdx];
    const isCorrect = selectedOption ? selectedOption.isCorrect : false;

    const feedbackOverlay = document.getElementById('usb-feedback');
    feedbackOverlay.style.display = 'block';

    const statusEl = document.getElementById('usb-feedback-status');
    const descEl = document.getElementById('usb-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'usb');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ¡Excelente Decisión de Seguridad! (+50 PTS)
      `;
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'usb');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Decisión de Riesgo — Revisa la explicación correcta (0 PTS)
      `;
    }

    descEl.innerHTML = `
      <p style="margin-bottom:0.4rem; font-weight:600; color:white;">Explicación Práctica de Seguridad:</p>
      <p style="margin-bottom:0.6rem; font-size:0.82rem; color:var(--accent-green);">
        ✅ <strong>La respuesta correcta era:</strong> ${currentCase.options.find(o => o.isCorrect).text}
      </p>
      ${currentCase.explanation}
    `;

    const nextBtn = document.getElementById('usb-next-btn');
    if (this.currentCaseIndex === this.cases.length - 1) {
      nextBtn.textContent = 'Finalizar Módulo';
    } else {
      nextBtn.textContent = 'Siguiente Caso →';
    }
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      app.markModuleCompleted('usb');
      app.showModalAlert({
        title: '🔌 Módulo Dispositivos USB Completado',
        message: '¡Felicidades! Has completado exitosamente la simulación de protección de dispositivos USB. Aprendiste a evitar trampas de Baiting y proteger los equipos corporativos de La Corporación Suiche 7B.',
        type: 'success'
      }).then(() => {
        app.navigateTo('dashboard');
      });
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 6: USO SEGURO DE CHATGPT E IA EN LA OFICINA (TAPA LOS DATOS)
// ============================================================================
class AiSecurityGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.brainAnimId = null;
    this.redactedTokens = new Set();

    this.cases = [
      {
        id: 1,
        context: "Carta de Trabajo y Aumento de Sueldo en Capital Humano",
        department: "Gerencia Capital Humano / Administración",
        template: `Hola ChatGPT, ayúdame a redactar una carta de felicitación con un <span class="dlp-token" data-token="t_rc" data-sensitive="false">[Tono Cordial y Motivador]</span> por <span class="dlp-token" data-token="t_mti" data-sensitive="false">[Buen Desempeño Anual]</span>.<br><br>Aquí están los datos del trabajador para que armes el texto:<br>• Colaborador: <span class="dlp-token" data-token="t_pan" data-sensitive="true">[María Gómez — Cédula V-15.442.910]</span><br>• Nuevo Sueldo Confidencial: <span class="dlp-token" data-token="t_track2" data-sensitive="true">[Sueldo Mensual + Bono Ejecutivo Confidencial]</span><br>• Cuenta Nómina: <span class="dlp-token" data-token="t_cred" data-sensitive="true">[Cuenta Bancaria 0134-0092-18-9928371]</span>`,
        sensitiveKeys: ['t_pan', 't_track2', 't_cred'],
        explanation: "<strong>¡Excelente!</strong> Puedes usar ChatGPT para que te ayude a redactar una carta con buen tono, pero <strong>siempre debes tapar u omitir nombres reales, números de cédula, sueldos y cuentas bancarias</strong> del personal de Suiche 7B."
      },
      {
        id: 2,
        context: "Resumen de Reunión de Finanzas y Presupuesto Anual",
        department: "Dirección Finanzas / Gestión Estratégica",
        template: `Por favor hazme un <span class="dlp-token" data-token="t_tone" data-sensitive="false">[Resumen en 3 Puntos Clave]</span> de esta nota de reunión:<br><br>"En el cierre trimestral de Suiche 7B obtuvimos <span class="dlp-token" data-token="t_oficio" data-sensitive="true">[Ingresos Internos Confidenciales por $1.850.000]</span>. Además, el archivo Excel de presupuesto quedó guardado con la <span class="dlp-token" data-token="t_fw" data-sensitive="true">[Contraseña: FinanzasSuiche2026*]</span> para presentarlo en la <span class="dlp-token" data-token="t_patch" data-sensitive="false">[Próxima Reunión del Lunes]</span>."`,
        sensitiveKeys: ['t_oficio', 't_fw'],
        explanation: "<strong>¡Muy bien hecho!</strong> Todo lo que escribes en un chat de IA gratuito queda guardado en servidores externos. Jamás pongas cifras financieras secretas de la empresa ni contraseñas de tus archivos Excel."
      },
      {
        id: 3,
        context: "Respuesta a un Reclamo de un Cliente por un Cobro en Punto de Venta",
        department: "Gerencia Operaciones y Servicio al Cliente",
        template: `Ayúdame a escribir un correo de respuesta con <span class="dlp-token" data-token="t_sql" data-sensitive="false">[Disculpas y Explicación Amable]</span> para un cliente:<br><br>El caso pertenece al tarjetahabiente <span class="dlp-token" data-token="t_vip" data-sensitive="true">[Tarjeta de Débito N° 4509-1288-3910-4421 de Carlos Rivas]</span> quien reportó un cobro duplicado y nos dejó su <span class="dlp-token" data-token="t_key" data-sensitive="true">[Teléfono 0414-5559922 y Dirección de Habitación]</span>.`,
        sensitiveKeys: ['t_vip', 't_key'],
        explanation: "<strong>¡Protección Total al Cliente!</strong> Nunca pegues números completos de tarjetas de débito/crédito ni teléfonos o direcciones personales de clientes en herramientas de Inteligencia Artificial."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.startBrain3DAnimation();
    this.renderCase();
  }

  startBrain3DAnimation() {
    const canvas = document.getElementById('ai-brain-3d-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (this.brainAnimId) cancelAnimationFrame(this.brainAnimId);

    const nodes = Array.from({ length: 28 }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 28);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        x: Math.cos(theta) * Math.sin(phi) * 78,
        y: Math.sin(theta) * Math.sin(phi) * 62,
        z: Math.cos(phi) * 78
      };
    });

    let angle = 0;
    const draw = () => {
      angle += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const c = this.cases[this.currentCaseIndex];
      const remainingLeaks = c ? c.sensitiveKeys.filter(k => !this.redactedTokens.has(k)).length : 0;
      const isClean = remainingLeaks === 0;
      const mainColor = isClean ? '#4ade80' : '#ef4444';
      const glowColor = isClean ? 'rgba(74, 222, 128, 0.25)' : 'rgba(239, 68, 68, 0.25)';

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const proj = nodes.map(n => {
        const rx = n.x * cos - n.z * sin;
        const rz = n.z * cos + n.x * sin;
        const scale = 260 / (260 + rz);
        return { px: cx + rx * scale, py: cy + n.y * scale, scale };
      });

      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const dx = proj[i].px - proj[j].px;
          const dy = proj[i].py - proj[j].py;
          if (dx * dx + dy * dy < 3800) {
            ctx.beginPath();
            ctx.moveTo(proj[i].px, proj[i].py);
            ctx.lineTo(proj[j].px, proj[j].py);
            ctx.stroke();
          }
        }
      }

      proj.forEach(p => {
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(2, 4 * p.scale), 0, Math.PI * 2);
        ctx.fill();
      });

      this.brainAnimId = requestAnimationFrame(draw);
    };
    draw();
  }

  renderCase() {
    this.hasAnswered = false;
    this.redactedTokens = new Set();
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('ai-case-index').textContent = this.currentCaseIndex + 1;
    document.getElementById('ai-case-total').textContent = this.cases.length;
    document.getElementById('ai-context-title').textContent = c.context;
    document.getElementById('ai-dept-badge').textContent = c.department;
    document.getElementById('ai-prompt-content').innerHTML = c.template;

    document.getElementById('ai-feedback').style.display = 'none';
    document.getElementById('ai-actions').style.display = 'flex';

    document.querySelectorAll('#ai_sec-view .dlp-token').forEach(el => {
      const tokenKey = el.getAttribute('data-token');
      el.setAttribute('data-original', el.textContent);
      el.addEventListener('click', () => this.toggleTokenRedaction(tokenKey, el));
    });

    this.updateRiskMeter();
  }

  toggleTokenRedaction(tokenKey, el) {
    if (this.hasAnswered) return;
    app.playAudio('click');

    if (this.redactedTokens.has(tokenKey)) {
      this.redactedTokens.delete(tokenKey);
      el.classList.remove('redacted');
      el.textContent = el.getAttribute('data-original');
    } else {
      this.redactedTokens.add(tokenKey);
      el.classList.add('redacted');
      el.textContent = '🙈 [DATO PRIVADO TAPADO]';
    }
    this.updateRiskMeter();
  }

  updateRiskMeter() {
    const c = this.cases[this.currentCaseIndex];
    const totalSensitive = c.sensitiveKeys.length;
    const exposedSensitive = c.sensitiveKeys.filter(k => !this.redactedTokens.has(k)).length;
    const riskPct = Math.round((exposedSensitive / totalSensitive) * 100);

    const riskValEl = document.getElementById('ai-dlp-risk-value');
    const riskBarEl = document.getElementById('ai-dlp-risk-bar');
    const badgeEl = document.getElementById('ai-neural-state-badge');

    if (riskBarEl) riskBarEl.style.width = `${riskPct}%`;

    if (riskPct === 0) {
      if (riskValEl) {
        riskValEl.textContent = '0% ¡LISTO Y SEGURO PARA ENVIAR!';
        riskValEl.style.color = '#4ade80';
      }
      if (riskBarEl) riskBarEl.style.background = '#4ade80';
      if (badgeEl) {
        badgeEl.textContent = 'MENSAJE PROTEGIDO';
        badgeEl.style.borderColor = '#4ade80';
        badgeEl.style.color = '#4ade80';
      }
    } else {
      if (riskValEl) {
        riskValEl.textContent = `FALTAN ${exposedSensitive} DATOS ROJOS POR TAPAR`;
        riskValEl.style.color = '#ef4444';
      }
      if (riskBarEl) riskBarEl.style.background = '#ef4444';
      if (badgeEl) {
        badgeEl.textContent = 'DATOS PRIVADOS A LA VISTA';
        badgeEl.style.borderColor = '#ef4444';
        badgeEl.style.color = '#fca5a5';
      }
    }
  }

  verifySanitization() {
    if (this.hasAnswered) return;
    const c = this.cases[this.currentCaseIndex];
    const allSensitiveRedacted = c.sensitiveKeys.every(k => this.redactedTokens.has(k));
    this.makeDecision(allSensitiveRedacted);
  }

  makeDecision(isSuccess) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const isCorrect = Boolean(isSuccess);
    if (isCorrect) {
      c.sensitiveKeys.forEach(k => this.redactedTokens.add(k));
      this.updateRiskMeter();
    }

    document.getElementById('ai-actions').style.display = 'none';
    const fb = document.getElementById('ai-feedback');
    fb.style.display = 'block';

    const statusEl = document.getElementById('ai-feedback-status');
    const descEl = document.getElementById('ai-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'ai_sec');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '🧠 ¡Datos Privados Tapados con Éxito! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'ai_sec');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Dejaste Datos Privados sin Tapar en el Mensaje (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('ai-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Situación →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      if (this.brainAnimId) cancelAnimationFrame(this.brainAnimId);
      app.markModuleCompleted('ai_sec');
      app.showModalAlert({
        title: '🧠 Módulo Uso Seguro de ChatGPT e IA Completado',
        message: '¡Felicidades! Ya sabes cómo usar herramientas de Inteligencia Artificial en la oficina sin exponer sueldos, cédulas, cuentas ni datos privados de Corporación Suiche 7B.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 7: PROTECCIÓN DE TARJETAS Y CLIENTES (TARJETA 3D INTERACTIVA)
// ============================================================================
class PciDssGame {
  constructor() {
    this.currentMissionIdx = 0;
    this.hasAnswered = false;

    this.items = [
      {
        id: 'pan_mask',
        reqBadge: 'Situación 1 · Reportes de Excel y Correos Internos',
        title: 'Ocultar los Números del Medio de la Tarjeta en Reportes',
        desc: 'En Finanzas o Atención al Cliente debes enviar un cuadro de Excel con varios casos de reclamos. Mira la Tarjeta 3D a la izquierda: tiene los 16 números completamente visibles (`4509 1288 3910 4421`). ¿Cómo debes escribir ese número de tarjeta en tu reporte o correo?',
        cardSide: 'front',
        targetZone: 'pan',
        rawStream: '⚠️ En tu Excel dice: 4509 1288 3910 4421 (¡Peligro: Número completo expuesto!)',
        protectedStream: '✅ En tu Excel ahora dice: 4509 12** **** 4421 (¡Protegido con asteriscos!)',
        options: [
          { text: 'Poner asteriscos en los números del medio y dejar solo los primeros 6 y últimos 4 (4509 12** **** 4421)', isCorrect: true },
          { text: 'Escribir los 16 números completos de la tarjeta en el correo para que todos los vean', isCorrect: false },
          { text: 'Mandar una foto de la tarjeta completa por el grupo de WhatsApp de la oficina', isCorrect: false }
        ],
        explanation: '<strong>¡Regla de Oro con Tarjetas!</strong> En cualquier reporte, correo o cuadro de Excel administrativo, jamás escribas los 16 dígitos completos: tapa siempre los dígitos centrales con asteriscos (`4509 12** **** 4421`).'
      },
      {
        id: 'sad_purge',
        reqBadge: 'Situación 2 · Los 3 Números Secretos del Reverso (CVV)',
        title: '¿Se pueden anotar los 3 numeritos de atrás de la tarjeta?',
        desc: 'La Tarjeta 3D acaba de girar mostrando la parte de atrás. Un cliente llama para una consulta y te quiere dictar los 3 numeritos de seguridad del reverso (`891`) para que los anotes en el expediente. ¿Qué debes hacer?',
        cardSide: 'back',
        targetZone: 'cvv',
        rawStream: '⚠️ Reverso de la Tarjeta: Código Secreto [ 891 ] visible',
        protectedStream: '✅ Código Secreto [ *** ] oculto — ¡Jamás se pide ni se anota!',
        options: [
          { text: 'Indicarle al cliente que NO nos dicte esos 3 números y jamás anotarlos en papel, correo ni computadora', isCorrect: true },
          { text: 'Anotar los 3 números en una libreta o archivo Word por si los necesitamos mañana', isCorrect: false },
          { text: 'Pedirle que nos mande una foto de la parte de atrás de su tarjeta por correo', isCorrect: false }
        ],
        explanation: 'Los <strong>3 números del reverso de la tarjeta (código CVV)</strong> son ultra secretos para compras por internet. Ningún trabajador de Suiche 7B debe pedirlos ni anotarlos nunca.'
      },
      {
        id: 'hsm_pin',
        reqBadge: 'Situación 3 · La Clave Secreta de 4 Dígitos del Cajero / Punto de Venta',
        title: '¿Podemos pedir o guardar la Clave del Cajero (PIN) de un cliente?',
        desc: 'Mira el Chip Dorado en la Tarjeta 3D. Para resolver un reclamo de un cajero automático o punto de venta, un compañero sugiere preguntarle al cliente cuál es su clave secreta de 4 dígitos. ¿Es correcto?',
        cardSide: 'iso',
        targetZone: 'chip',
        rawStream: '⚠️ Consulta: ¿Solicitar clave secreta de 4 dígitos al cliente?',
        protectedStream: '✅ Clave Secreta 100% Privada — Ningún empleado debe conocerla',
        options: [
          { text: 'Prohibido: La clave de 4 dígitos (PIN) es secreta del cliente y ningún empleado debe pedirla ni conocerla', isCorrect: true },
          { text: 'Pedirle la clave solo por teléfono para probar su tarjeta rápidamente', isCorrect: false },
          { text: 'Anotar la clave del cliente en el ticket de atención al cliente', isCorrect: false }
        ],
        explanation: 'La <strong>clave secreta (PIN)</strong> del cajero o punto de venta es exclusivamente del dueño de la tarjeta. En Suiche 7B ningún área administrativa ni técnica solicita jamás la clave de un tarjetahabiente.'
      },
      {
        id: 'qa_anonymize',
        reqBadge: 'Situación 4 · Presentaciones, Capacitaciones y Ejemplos',
        title: '¿Qué tarjetas usamos para hacer una presentación o manual de oficina?',
        desc: 'Debes preparar unas láminas de PowerPoint o un manual para entrenar a nuevos compañeros de tu departamento. ¿Qué números de tarjeta debes poner en las capturas de ejemplo?',
        cardSide: 'front',
        targetZone: 'pan',
        rawStream: '⚠️ Lámina de PowerPoint con datos de un cliente real de un banco',
        protectedStream: '✅ Lámina de PowerPoint con datos inventados de ejemplo (4000 00** **** 0001)',
        options: [
          { text: 'Usar siempre nombres y números de tarjetas inventados (ficticios) o tapados en manuales y presentaciones', isCorrect: true },
          { text: 'Tomar la foto de una tarjeta real de un cliente verdadero y pegarla en el PowerPoint', isCorrect: false },
          { text: 'Poner la foto de mi propia tarjeta de débito personal en el manual', isCorrect: false }
        ],
        explanation: 'En manuales, presentaciones de PowerPoint y capacitaciones internas siempre debemos usar <strong>datos ficticios de ejemplo</strong>, nunca datos de clientes reales.'
      }
    ];
  }

  init() {
    this.currentMissionIdx = 0;
    this.hasAnswered = false;
    this.renderMission();
  }

  rotateCard3D(mode) {
    const cardInner = document.getElementById('pci-3d-card-inner');
    if (!cardInner) return;
    app.playAudio('click');
    cardInner.classList.remove('is-flipped');

    if (mode === 'back') {
      cardInner.classList.add('is-flipped');
      cardInner.style.transform = 'rotateY(180deg)';
    } else if (mode === 'iso') {
      cardInner.style.transform = 'rotateY(-28deg) rotateX(18deg) scale(1.03)';
    } else {
      cardInner.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  }

  selectZone(zoneId) {
    app.playAudio('click');
    ['chip', 'pan', 'track2', 'cvv'].forEach(z => {
      const el = document.getElementById(`zone-${z}`);
      if (el) {
        if (z === zoneId) el.classList.add('zone-active-pulse');
        else el.classList.remove('zone-active-pulse');
      }
    });

    // Si el usuario toca directamente la zona de la tarjeta 3D, aplicar efecto visual interactivo
    if (zoneId === 'pan') {
      const panEl = document.getElementById('card3d-live-pan');
      if (panEl) panEl.innerHTML = '4509 12<span style="color:#4ade80;">** ****</span> 4421';
    } else if (zoneId === 'cvv') {
      const cvvEl = document.getElementById('card3d-live-cvv');
      if (cvvEl) cvvEl.textContent = '***';
    }
  }

  renderMission() {
    this.hasAnswered = false;
    const m = this.items[this.currentMissionIdx];

    document.getElementById('pcidss-mission-idx').textContent = this.currentMissionIdx + 1;
    document.getElementById('pcidss-mission-total').textContent = this.items.length;
    document.getElementById('pcidss-req-badge').textContent = m.reqBadge;
    document.getElementById('pcidss-mission-title').textContent = m.title;
    document.getElementById('pcidss-mission-desc').textContent = m.desc;
    document.getElementById('pcidss-live-stream').textContent = m.rawStream;
    document.getElementById('pcidss-live-stream').style.color = '#fbba0a';

    this.rotateCard3D(m.cardSide);
    this.selectZone(m.targetZone);

    const list = document.getElementById('pcidss-controls-list');
    list.innerHTML = '';
    this.currentOptions = shuffleOptions(m.options, this);
    const letters = ['A', 'B', 'C'];
    this.currentOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.75rem 1rem';
      btn.style.fontSize = '0.85rem';
      btn.textContent = `${letters[idx] || idx + 1}) ${opt.text}`;
      btn.onclick = () => this.executeControl(idx);
      list.appendChild(btn);
    });

    document.getElementById('pcidss-feedback').style.display = 'none';
  }

  executeControl(optionIdx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const m = this.items[this.currentMissionIdx];
    const optionsList = this.currentOptions || m.options;
    const isCorrect = optionsList[optionIdx] ? optionsList[optionIdx].isCorrect : false;

    const fb = document.getElementById('pcidss-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('pcidss-feedback-status');
    const descEl = document.getElementById('pcidss-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(40, true, 'pci_dss');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '💳 ¡Excelente Cuidado de los Datos de Tarjeta! (+40 PTS)';

      const streamEl = document.getElementById('pcidss-live-stream');
      if (streamEl) {
        streamEl.textContent = m.protectedStream;
        streamEl.style.color = '#4ade80';
      }
      if (m.id === 'pan_mask') {
        const panEl = document.getElementById('card3d-live-pan');
        if (panEl) panEl.innerHTML = '4509 12<span style="color:#4ade80;">** ****</span> 4421';
      } else if (m.id === 'sad_purge') {
        const cvvEl = document.getElementById('card3d-live-cvv');
        if (cvvEl) cvvEl.textContent = '***';
      }
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'pci_dss');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Cuidado: Eso expondría la tarjeta del cliente (0 PTS)';
    }

    descEl.innerHTML = m.explanation;
    document.getElementById('pcidss-next-btn').textContent =
      this.currentMissionIdx === this.items.length - 1 ? 'Finalizar Módulo' : 'Siguiente Situación →';
  }

  classifyItem() {
    const m = this.items[this.currentMissionIdx];
    const opts = this.currentOptions || (m ? m.options : []);
    const cIdx = opts.findIndex(o => o.isCorrect);
    this.executeControl(cIdx >= 0 ? cIdx : 0);
    this.nextMission();
  }

  nextMission() {
    app.playAudio('click');
    if (this.currentMissionIdx < this.items.length - 1) {
      this.currentMissionIdx++;
      this.renderMission();
    } else {
      app.markModuleCompleted('pci_dss');
      app.showModalAlert({
        title: '💳 Módulo Protección de Tarjetas y Clientes Completado',
        message: '¡Excelente! Ahora dominas cómo proteger los números de tarjetas, el código de 3 dígitos de atrás (CVV) y la privacidad de los tarjetahabientes en el trabajo diario.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 8: TU CELULAR 3D Y CÓDIGOS QR TRAMPA
// ============================================================================
class QuishingMfaGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        title: "Reto 1: Tu Celular Vibra a Medianoche Pidiendo Permiso para Entrar",
        stageBadge: "RETO 1 · TOCA LA PANTALLA DEL CELULAR 3D",
        phoneTime: "11:48 PM",
        phoneMode: "push_bombing",
        visualTitle: "🔎 Lupa Detectora: ¿Quién intenta entrar a esta hora?",
        visualMeta: "Haz clic en '🔎 Ver Pista Oculta' para descubrir desde dónde están intentando abrir tu correo...",
        xrayRevealed: "⚠️ PISTA DESCUBIERTA: Alguien en otro país adivinó tu contraseña y te está mandando muchos avisos seguidos a las 11:48 PM para que presiones 'Aceptar' por cansancio.",
        scenarioDesc: "Estás en tu casa descansando a las 11:48 de la noche. De pronto tu celular empieza a vibrar muchas veces seguidas preguntando: '¿Le das permiso a otra computadora para entrar a tu cuenta de Suiche 7B?'. ¡Toca el botón correcto en la pantalla del Celular 3D a la izquierda!",
        options: [
          { text: "Tocar 'NO FUI YO (BLOQUEAR)' en el celular y avisar a Seguridad para cambiar mi contraseña", isCorrect: true },
          { text: "Tocar 'Sí, Aprobar' para que el celular deje de hacer ruido y seguir durmiendo", isCorrect: false },
          { text: "Ignorar el aviso y no decirle a nadie en la oficina", isCorrect: false }
        ],
        explanation: "<strong>¡Muy bien!</strong> Si tu celular te pregunta si estás intentando entrar a tu cuenta cuando tú no estás usando la computadora, significa que alguien más intenta meterse. <strong>Nunca presiones Aprobar si no fuiste tú.</strong>"
      },
      {
        title: "Reto 2: El Código QR con un Supuesto 'Bono Especial' (Quishing)",
        stageBadge: "RETO 2 · ESCÁNER DE CÓDIGO QR EN TU CELULAR 3D",
        phoneTime: "12:15 PM",
        phoneMode: "qr_scanner",
        visualTitle: "🔎 Lupa Detectora: ¿A qué página lleva este Código QR?",
        visualMeta: "Toca el cuadro del Código QR en el celular 3D o el botón '🔎 Ver Pista Oculta' para ver a dónde lleva...",
        xrayRevealed: "🚨 PISTA DESCUBIERTA: El código QR NO es de Suiche 7B; lleva a una página pirata ('bono-falso-trampa.xyz') diseñada para robarte la contraseña de tu correo.",
        scenarioDesc: "Recibes un volante o un correo muy llamativo que dice: '¡Escanea este Código QR con tu celular y escribe tu contraseña del trabajo para cobrar un Bono Especial hoy!'. Mira el visor en el Celular 3D:",
        options: [
          { text: "Tocar 'CERRAR PÁGINA FALSA' en el celular y no escribir jamás mi contraseña en códigos QR dudosos", isCorrect: true },
          { text: "Escribir mi usuario y contraseña de Suiche 7B rápido para no perderme el bono", isCorrect: false },
          { text: "Mandarle foto del código QR por WhatsApp a todos mis compañeros de oficina", isCorrect: false }
        ],
        explanation: "Los estafadores usan <strong>Códigos QR falsos</strong> con promesas de bonos, premios o sorteos para llevarte a páginas engañosas desde tu celular. Nunca ingreses tu clave del trabajo tras escanear un QR desconocido."
      },
      {
        title: "Reto 3: Entrando a tu Correo en la Oficina (Toca el Número 84)",
        stageBadge: "RETO 3 · TECLADO DEL CELULAR 3D",
        phoneTime: "08:30 AM",
        phoneMode: "number_match",
        visualTitle: "🔎 Lupa Detectora: Verificando tu propio ingreso",
        visualMeta: "En la pantalla de tu computadora de oficina ves grande el número: [ 84 ].",
        xrayRevealed: "✅ PISTA CONFIRMADA: Fuiste tú mismo quien acaba de abrir el correo en tu escritorio de Corporación Suiche 7B a las 8:30 AM.",
        scenarioDesc: "Acabas de llegar a tu oficina en Suiche 7B, abres tu correo en tu computadora y la pantalla te dice: 'Toca el número 84 en tu celular para confirmar que eres tú'. ¡Toca el número 84 directamente en el teclado del Celular 3D!",
        options: [
          { text: "Tocar el número [ 84 ] en la pantalla del celular porque yo mismo estoy abriendo mi correo", isCorrect: true },
          { text: "Tocar cualquier otro número sin mirar la pantalla de mi computadora", isCorrect: false },
          { text: "Mandarle ese número por mensaje a otra persona", isCorrect: false }
        ],
        explanation: "<strong>¡Perfecto!</strong> Cuando tú mismo estás iniciando sesión en tu computadora de trabajo y confirmas el mismo número en tu celular, tu cuenta queda 100% protegida."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    document.getElementById('qmfa-feedback').style.display = 'none';
    this.renderCase();
  }

  renderCase() {
    this.hasAnswered = false;
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('qmfa-case-counter').textContent = `${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('qmfa-stage-badge').textContent = c.stageBadge;
    document.getElementById('qmfa-scenario-title').textContent = c.title;
    document.getElementById('qmfa-scenario-desc').textContent = c.scenarioDesc;
    document.getElementById('qmfa-phone-time').textContent = c.phoneTime;
    document.getElementById('qmfa-visual-title').textContent = c.visualTitle;
    document.getElementById('qmfa-visual-meta').textContent = c.visualMeta;
    document.getElementById('qmfa-visual-meta').style.color = 'var(--text-muted)';

    this.renderPhone3DScreen(c);

    const container = document.getElementById('qmfa-options-container');
    container.innerHTML = '';
    this.currentOptions = shuffleOptions(c.options, this);
    const letters = ['A', 'B', 'C'];
    this.currentOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.7rem 1rem';
      btn.style.fontSize = '0.84rem';
      btn.textContent = `${letters[idx] || idx + 1}) ${opt.text}`;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('qmfa-feedback').style.display = 'none';
  }

  renderPhone3DScreen(c) {
    const screen = document.getElementById('qmfa-phone-screen');
    const phoneWrap = document.getElementById('qmfa-phone-3d');
    if (!screen || !phoneWrap) return;

    phoneWrap.classList.remove('phone-vibrating');

    if (c.phoneMode === 'push_bombing') {
      phoneWrap.classList.add('phone-vibrating');
      const phoneBtns = shuffleOptions([
        { label: '🛑 NO FUI YO (BLOQUEAR)', cls: 'btn-danger', isCorrect: true },
        { label: 'Sí, Aprobar', cls: 'btn-secondary', isCorrect: false }
      ]);
      screen.innerHTML = `
        <div style="text-align:center; padding:0.4rem;">
          <div style="font-size:0.7rem; color:#f87171; font-weight:700; margin-bottom:0.4rem;">🚨 AVISO NOCTURNO (7 SEGUIDOS)</div>
          <div style="background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:10px; padding:0.65rem; font-size:0.74rem; margin-bottom:0.7rem;">
            <strong>¿Eres tú intentando entrar a tu cuenta?</strong><br>
            <span style="color:#cbd5e1; font-size:0.68rem;">Desde: Otro País Desconocido</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.45rem;">
            ${phoneBtns.map(b => `
              <button type="button" class="btn ${b.cls}" style="padding:0.48rem; font-size:0.72rem; width:100%;" onclick="games.quishing_mfa.makeDecision(${b.isCorrect})">
                ${b.label}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (c.phoneMode === 'qr_scanner') {
      screen.innerHTML = `
        <div style="text-align:center; padding:0.3rem;">
          <div style="font-size:0.68rem; color:var(--accent-cyan); font-weight:700; margin-bottom:0.4rem;">CÁMARA DE TU CELULAR</div>
          <div class="qr-laser-box" onclick="games.quishing_mfa.runXrayScan()" title="Toca para revisar el QR">
            <div class="qr-laser-line"></div>
            <div style="font-family:monospace; font-size:0.95rem; line-height:1.15; letter-spacing:2px; color:#e2e8f0;">
              ▣▤▥▦▣<br>▤▥▣▤▥<br>▥▣◉▣▤<br>▣▤▥▦▣
            </div>
          </div>
          <div style="font-size:0.66rem; color:#fca5a5; margin:0.45rem 0; font-weight:700;">
            ⚠️ Enlace: bono-falso-trampa.xyz
          </div>
          <button type="button" class="btn btn-danger" style="padding:0.45rem; font-size:0.72rem; width:100%;" onclick="games.quishing_mfa.makeDecision(true)">
            🚫 CERRAR PÁGINA FALSA
          </button>
        </div>
      `;
    } else {
      const nums = shuffleOptions([
        { num: 19, isCorrect: false },
        { num: 84, isCorrect: true },
        { num: 42, isCorrect: false }
      ]);
      screen.innerHTML = `
        <div style="text-align:center; padding:0.3rem;">
          <div style="font-size:0.7rem; color:#4ade80; font-weight:700; margin-bottom:0.35rem;">🔐 CONFIRMA TU INGRESO</div>
          <div style="font-size:0.68rem; color:#cbd5e1; margin-bottom:0.55rem;">Toca el número que ves en tu computadora (<strong>84</strong>):</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.4rem; margin-bottom:0.5rem;">
            ${nums.map(n => `
              <button type="button" class="btn btn-secondary" style="padding:0.5rem 0.2rem; font-family:var(--font-mono); font-size:0.9rem;" onclick="games.quishing_mfa.makeDecision(${n.isCorrect})">${n.num}</button>
            `).join('')}
          </div>
          <div style="font-size:0.64rem; color:#94a3b8;">Oficina Suiche 7B · Caracas</div>
        </div>
      `;
    }
  }

  runXrayScan() {
    const c = this.cases[this.currentCaseIndex];
    app.playAudio('click');
    const metaEl = document.getElementById('qmfa-visual-meta');
    if (metaEl) {
      metaEl.textContent = c.xrayRevealed;
      metaEl.style.color = '#fbba0a';
    }
  }

  makeDecision(idxOrBool) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const phoneWrap = document.getElementById('qmfa-phone-3d');
    if (phoneWrap) phoneWrap.classList.remove('phone-vibrating');

    const c = this.cases[this.currentCaseIndex];
    const optionsList = this.currentOptions || c.options;
    const isCorrect = typeof idxOrBool === 'boolean'
      ? idxOrBool
      : (optionsList[idxOrBool] ? optionsList[idxOrBool].isCorrect : false);

    const fb = document.getElementById('qmfa-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('qmfa-feedback-status');
    const descEl = document.getElementById('qmfa-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'quishing_mfa');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '📲 ¡Muy Bien! Protegiste tu Celular y tu Cuenta (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'quishing_mfa');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Cuidado: Caíste en una trampa móvil (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('qmfa-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Reto →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      app.markModuleCompleted('quishing_mfa');
      app.showModalAlert({
        title: '📲 Módulo Celular 3D y Códigos QR Completado',
        message: '¡Excelente trabajo! Ya sabes cómo actuar ante avisos sospechosos en tu celular y cómo detectar códigos QR engañosos.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 9: PAGOS URGENTES, PROVEEDORES Y FALSOS JEFES
// ============================================================================
class BecFraudGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.waveAnimId = null;
    this.isScanningWave = false;

    this.cases = [
      {
        title: "Caso 1: El 'Presidente' Apurado Pidiendo un Pago Secreto el Viernes",
        sender: "presidente.suiche7b@gmail.com",
        subject: "URGENTE Y CONFIDENCIAL: Haz esta transferencia hoy sin comentarle a nadie",
        scenarioDesc: "Son las 4:40 PM del viernes. Te llega un correo y una nota de voz que suena igualita al Presidente de Suiche 7B diciendo: 'Estoy en una reunión privada, transfiere urgente este anticipo a esta cuenta nueva y no llames a nadie'. ¡Toca las 3 lupas de la izquierda para averiguar la verdad!",
        evidences: [
          "📧 [LUPA 1 · VER CORREO]: ¡Mira la dirección! Dice 'presidente.suiche7b@gmail.com'. Los directivos de Suiche 7B nunca usan correos @gmail.com para ordenar pagos.",
          "🏦 [LUPA 2 · VER CUENTA]: La cuenta bancaria que pide el mensaje es de un desconocido que no está registrado en Finanzas ni Administración.",
          "📞 [LUPA 3 · LLAMAR A OFICINA]: Llamaste a la extensión interna de Presidencia y te confirmaron que el Presidente NUNCA envió ese mensaje (su voz fue imitada por computadora)."
        ],
        options: [
          { text: "No hacer el pago, confirmar por teléfono interno y pedir siempre las firmas de autorización de la empresa", isCorrect: true },
          { text: "Hacer la transferencia rápido por miedo a que el jefe se moleste", isCorrect: false },
          { text: "Responderle al correo @gmail.com preguntando a nombre de quién va el cheque", isCorrect: false }
        ],
        explanation: "Esta estafa se llama <strong>El Fraude del Falso Jefe</strong>: los delincuentes te presionan un viernes por la tarde y te piden 'mantenerlo en secreto' para que no llames a tu supervisor. <strong>En Suiche 7B ningún pago sale sin seguir las firmas y aprobaciones normales.</strong>"
      },
      {
        title: "Caso 2: El Proveedor que Pide Cambiar su Cuenta Bancaria por Correo",
        sender: "cobranzas@proveedor-oficina.com.ve",
        subject: "Aviso: A partir de hoy deposítennos las facturas en esta nueva cuenta",
        scenarioDesc: "Un proveedor habitual de la oficina envía una carta en PDF diciendo que cambió de banco y pide que el pago de este mes se deposite a nombre de otra persona. Toca las 3 lupas a la izquierda:",
        evidences: [
          "📧 [LUPA 1 · VER CORREO]: Aunque el correo parece del proveedor, un estafador se metió en su buzón para mandar cartas falsas a sus clientes.",
          "🏦 [LUPA 2 · VER CUENTA]: La cuenta nueva del PDF está a nombre de una persona natural que no tiene nada que ver con la empresa proveedora.",
          "📞 [LUPA 3 · LLAMAR A OFICINA]: Al llamar al teléfono fijo de toda la vida del proveedor, el gerente te dice: '¡Cuidado, nosotros NO hemos cambiado de cuenta bancaria!'."
        ],
        options: [
          { text: "No cambiar la cuenta bancaria hasta llamar por teléfono al contacto conocido de siempre del proveedor", isCorrect: true },
          { text: "Cambiar la cuenta en el sistema y transferir el dinero sin llamar", isCorrect: false },
          { text: "Llamar al número de celular extraño que venía escrito dentro de la carta sospechosa", isCorrect: false }
        ],
        explanation: "Cuando un proveedor pida cambiar su cuenta bancaria para recibir pagos de Suiche 7B, <strong>siempre debes confirmar llamando al teléfono que ya teníamos guardado desde que se firmó el contrato</strong>, nunca al número que venga en el correo nuevo."
      },
      {
        title: "Caso 3: Correo Falso Pidiendo la Lista de Sueldos y Cédulas del Personal",
        sender: "auditoria.externa@revision-bancaria.org",
        subject: "Envío inmediato de nómina, cédulas y teléfonos de todos los empleados",
        scenarioDesc: "Recibes un correo que dice ser de unos 'Auditores Externos' exigiendo que les envíes en los próximos 20 minutos el archivo Excel con los nombres, cédulas, sueldos y direcciones de todo el personal de Suiche 7B. Usa las 3 lupas:",
        evidences: [
          "📧 [LUPA 1 · VER CORREO]: El remitente '@revision-bancaria.org' es un correo externo desconocido que no pertenece a ninguna institución oficial.",
          "🏦 [LUPA 2 · VER ARCHIVO PEDIDO]: Están pidiendo datos privados de nómina para suplantar la identidad de los trabajadores.",
          "📞 [LUPA 3 · LLAMAR A OFICINA]: Consultaste con Capital Humano y Cumplimiento, y confirmaron que no existe ninguna auditoría pidiendo esos datos por correo."
        ],
        options: [
          { text: "Negarse a enviar el archivo y reportar el correo a Seguridad de la Información", isCorrect: true },
          { text: "Enviarles el Excel con todas las cédulas y sueldos para salir del paso", isCorrect: false },
          { text: "Enviarles solo la mitad de la lista de trabajadores", isCorrect: false }
        ],
        explanation: "Los datos de nómina, cédulas, teléfonos y contratos de los trabajadores son estrictamente confidenciales y jamás se envían por correo ante solicitudes apresuradas de desconocidos."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.startWave3DAnimation();
    this.renderCase();
  }

  startWave3DAnimation() {
    const canvas = document.getElementById('bec-wave-3d-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (this.waveAnimId) cancelAnimationFrame(this.waveAnimId);

    let phase = 0;
    const draw = () => {
      phase += this.isScanningWave ? 0.14 : 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const layers = [
        { color: '#ef4444', amp: this.isScanningWave ? 36 : 16, freq: 0.045 },
        { color: '#fbba0a', amp: this.isScanningWave ? 26 : 11, freq: 0.03 },
        { color: '#0088ff', amp: this.isScanningWave ? 18 : 8, freq: 0.06 }
      ];

      layers.forEach((l, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 2;
        for (let x = 0; x < canvas.width; x += 4) {
          const y = canvas.height / 2 +
            Math.sin(x * l.freq + phase + idx) * l.amp * Math.sin((x / canvas.width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      this.waveAnimId = requestAnimationFrame(draw);
    };
    draw();
  }

  triggerWaveAnalysis() {
    app.playAudio('incident_alert');
    this.isScanningWave = true;
    this.inspectEvidence(2);
    setTimeout(() => { this.isScanningWave = false; }, 2500);
  }

  inspectEvidence(lensIdx) {
    app.playAudio('click');
    const c = this.cases[this.currentCaseIndex];
    const out = document.getElementById('bec-evidence-output');
    if (out && c.evidences[lensIdx]) {
      out.textContent = c.evidences[lensIdx];
    }
  }

  renderCase() {
    this.hasAnswered = false;
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('bec-case-counter').textContent = `${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('bec-scenario-title').textContent = c.title;
    document.getElementById('bec-sender').textContent = c.sender;
    document.getElementById('bec-subject').textContent = c.subject;
    document.getElementById('bec-scenario-desc').textContent = c.scenarioDesc;
    document.getElementById('bec-evidence-output').textContent =
      '👆 Toca cualquiera de las 3 lupas de arriba (1. Ver Correo, 2. Ver Cuenta, 3. Llamar a Oficina) para descubrir la trampa...';

    const c1 = document.getElementById('bec-check-oob');
    const c2 = document.getElementById('bec-check-dual');
    if (c1) c1.checked = false;
    if (c2) c2.checked = false;

    const container = document.getElementById('bec-options-container');
    container.innerHTML = '';
    this.currentOptions = shuffleOptions(c.options, this);
    const letters = ['A', 'B', 'C'];
    this.currentOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.7rem 1rem';
      btn.style.fontSize = '0.85rem';
      btn.textContent = `${letters[idx] || idx + 1}) ${opt.text}`;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('bec-feedback').style.display = 'none';
  }

  makeDecision(idx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const optionsList = this.currentOptions || c.options;
    const isCorrect = optionsList[idx] ? optionsList[idx].isCorrect : false;

    const fb = document.getElementById('bec-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('bec-feedback-status');
    const descEl = document.getElementById('bec-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'bec_fraud');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '🏛️ ¡Estafa Detectada y Bloqueada a Tiempo! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'bec_fraud');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Peligro: Así es como roban pagos en las empresas (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('bec-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Caso →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      if (this.waveAnimId) cancelAnimationFrame(this.waveAnimId);
      app.markModuleCompleted('bec_fraud');
      app.showModalAlert({
        title: '🎙️ Módulo Pagos Urgentes y Falsos Jefes Completado',
        message: '¡Excelente! Ahora sabes cómo verificar cualquier solicitud urgente de pago, cambio de cuenta bancaria o envío de información administrativa en Corporación Suiche 7B.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 10: CAFETERÍAS, CASA Y WI-FI SEGURO (RADAR 3D)
// ============================================================================
class RemoteVpnGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.sonarAnimId = null;
    this.tunnelSwitches = { aes: false, killswitch: false };

    this.cases = [
      {
        title: "Situación 1: Conectarse al 'Wi-Fi Gratis' en un Café o Aeropuerto",
        ssid: "WiFi_Gratis_Sin_Clave (🔴 PUNTO ROJO PELIGROSO EN EL RADAR)",
        securitySpec: "Cualquier desconocido conectado a ese Wi-Fi puede espiar lo que haces",
        scenarioDesc: "Estás en una cafetería o en el aeropuerto y necesitas enviar un correo urgente de Suiche 7B desde tu laptop. En el Radar 3D ves un Wi-Fi abierto sin clave ('WiFi_Gratis_Sin_Clave'). ¡Enciende tus 2 escudos arriba y elige qué hacer!",
        options: [
          { text: "No usar el Wi-Fi gratis abierto; compartir los datos de mi celular con clave y encender la VPN de Suiche 7B", isCorrect: true },
          { text: "Conectarme al Wi-Fi gratis sin clave porque es más rápido y cómodo", isCorrect: false },
          { text: "Pedirle prestada la computadora a un desconocido en la cafetería para abrir mi correo", isCorrect: false }
        ],
        explanation: "Los <strong>Wi-Fi públicos o abiertos sin clave</strong> en cafeterías, centros comerciales o aeropuertos son muy peligrosos porque los atacantes crean redes trampa para robar contraseñas. Usa siempre datos móviles seguros y <strong>enciende la VPN de Suiche 7B</strong>."
      },
      {
        title: "Situación 2: Un Familiar en Casa Pide Prestada la Laptop del Trabajo",
        ssid: "Trabajando desde Casa con la Laptop de Suiche 7B",
        securitySpec: "Tu sesión de trabajo tiene acceso a las carpetas internas de la empresa",
        scenarioDesc: "Estás trabajando desde tu casa y un sobrino o familiar te dice: '¿Me prestas tu laptop de Suiche 7B media hora para ver una película en internet y descargar un juego?'. ¿Qué debes responder?",
        options: [
          { text: "Decirle amablemente que la laptop de Suiche 7B es solo para trabajar y bloquear la pantalla (Win + L) al levantarme", isCorrect: true },
          { text: "Prestarle la laptop del trabajo con tal de que no borre mis carpetas", isCorrect: false },
          { text: "Anotarle mi clave de la laptop en un papel para que él entre cuando quiera", isCorrect: false }
        ],
        explanation: "Las computadoras asignadas por <strong>Corporación Suiche 7B son de uso exclusivo para el trabajo</strong>. Muchas páginas de juegos o películas gratuitas instalan virus ocultos que pondrían en peligro toda la oficina."
      },
      {
        title: "Situación 3: Mandar Archivos de la Oficina a tu Correo Personal (@gmail)",
        ssid: "Cuidado de Documentos, Excel y Reportes de Trabajo",
        securitySpec: "Los correos y nubes personales no tienen la protección de la empresa",
        scenarioDesc: "Para terminar de revisar unas facturas, presupuestos o listados el fin de semana, piensas mandarte esos archivos confidenciales de Suiche 7B a tu correo personal `@gmail.com` o a tu WhatsApp personal. ¿Es correcto?",
        options: [
          { text: "No: Los documentos de Suiche 7B deben guardarse y revisarse únicamente en el correo y carpetas oficiales de la empresa", isCorrect: true },
          { text: "Sí, no pasa nada en mandármelos a mi Gmail personal si luego los borro", isCorrect: false },
          { text: "Subir los archivos de finanzas a una página web pública para bajarlos rápido", isCorrect: false }
        ],
        explanation: "Enviar documentos internos (facturas, nóminas, presupuestos, reportes) a correos personales (`@gmail`, `@hotmail`) o WhatsApp personal está prohibido porque saca la información del resguardo seguro de Suiche 7B."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.tunnelSwitches = { aes: false, killswitch: false };
    this.startSonar3DAnimation();
    this.renderCase();
  }

  startSonar3DAnimation() {
    const canvas = document.getElementById('wifi-sonar-3d-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (this.sonarAnimId) cancelAnimationFrame(this.sonarAnimId);

    let sweepAngle = 0;
    const blips = [
      { r: 42, a: 0.9, safe: true, label: 'VPN_S7B' },
      { r: 68, a: 2.4, safe: false, label: 'WIFI_GRATIS' },
      { r: 82, a: 4.3, safe: true, label: 'RED_SEGURA' },
      { r: 55, a: 5.5, safe: false, label: 'TRAMPA' }
    ];

    const draw = () => {
      sweepAngle = (sweepAngle + 0.03) % (Math.PI * 2);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const isTunnelSecure = this.tunnelSwitches.aes && this.tunnelSwitches.killswitch;
      const radarColor = isTunnelSecure ? '#4ade80' : '#38bdf8';

      [30, 60, 90].forEach(r => {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.strokeStyle = radarColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * 92, cy + Math.sin(sweepAngle) * 92);
      ctx.stroke();

      blips.forEach(b => {
        const bx = cx + Math.cos(b.a) * b.r;
        const by = cy + Math.sin(b.a) * b.r;
        ctx.fillStyle = b.safe ? '#4ade80' : '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      this.sonarAnimId = requestAnimationFrame(draw);
    };
    draw();
  }

  toggleTunnelSwitch(key) {
    app.playAudio('click');
    this.tunnelSwitches[key] = !this.tunnelSwitches[key];
    this.updateTunnelUI();
  }

  updateTunnelUI() {
    const aesBtn = document.getElementById('vpn-toggle-aes');
    const ksBtn = document.getElementById('vpn-toggle-killswitch');
    const pill = document.getElementById('vpn-tunnel-state-pill');

    if (aesBtn) {
      aesBtn.textContent = `${this.tunnelSwitches.aes ? '✅' : '⬜'} Escudo 1: Encender VPN de Suiche 7B`;
      aesBtn.style.borderColor = this.tunnelSwitches.aes ? '#4ade80' : '';
    }
    if (ksBtn) {
      ksBtn.textContent = `${this.tunnelSwitches.killswitch ? '✅' : '⬜'} Escudo 2: Bloquear Pantalla (Win + L)`;
      ksBtn.style.borderColor = this.tunnelSwitches.killswitch ? '#4ade80' : '';
    }

    const bothActive = this.tunnelSwitches.aes && this.tunnelSwitches.killswitch;
    if (pill) {
      pill.textContent = bothActive ? '¡ESCUDOS ACTIVADOS!' : 'ESCUDOS APAGADOS';
      pill.style.borderColor = bothActive ? '#4ade80' : '#ef4444';
      pill.style.color = bothActive ? '#4ade80' : '#fca5a5';
    }
  }

  renderCase() {
    this.hasAnswered = false;
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('vpn-case-counter').textContent = `${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('vpn-scenario-title').textContent = c.title;
    document.getElementById('vpn-ssid').textContent = c.ssid;
    document.getElementById('vpn-spec').textContent = c.securitySpec;
    document.getElementById('vpn-scenario-desc').textContent = c.scenarioDesc;
    this.updateTunnelUI();

    const container = document.getElementById('vpn-options-container');
    container.innerHTML = '';
    this.currentOptions = shuffleOptions(c.options, this);
    const letters = ['A', 'B', 'C'];
    this.currentOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.7rem 1rem';
      btn.style.fontSize = '0.85rem';
      btn.textContent = `${letters[idx] || idx + 1}) ${opt.text}`;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('vpn-feedback').style.display = 'none';
  }

  makeDecision(idx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const optionsList = this.currentOptions || c.options;
    const isCorrect = optionsList[idx] ? optionsList[idx].isCorrect : false;

    if (isCorrect) {
      this.tunnelSwitches.aes = true;
      this.tunnelSwitches.killswitch = true;
      this.updateTunnelUI();
    }

    const fb = document.getElementById('vpn-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('vpn-feedback-status');
    const descEl = document.getElementById('vpn-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'remote_vpn');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '📡 ¡Excelente Decisión de Trabajo Seguro! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'remote_vpn');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Cuidado: Eso pondría en riesgo la información de la oficina (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('vpn-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Situación →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      if (this.sonarAnimId) cancelAnimationFrame(this.sonarAnimId);
      app.markModuleCompleted('remote_vpn');
      app.showModalAlert({
        title: '📡 Módulo Cafeterías, Casa y Wi-Fi Seguro Completado',
        message: '¡Felicidades! Ahora sabes cómo trabajar de forma segura fuera de la oficina, evitar redes Wi-Fi peligrosas y resguardar tu laptop y archivos de Corporación Suiche 7B.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// Inicializar contenedores de los 10 juegos globales (Fase 1 + Fase 2)
const games = {
  // Fase 1 (Básico)
  phishing: new PhishingGame(),
  pci: new PciGame(),
  incident: new IncidentGame(),
  password: new PasswordGame(),
  usb: new UsbGame(),
  // Fase 2 (Simuladores 3D Interactivos para Todo el Personal)
  ai_sec: new AiSecurityGame(),
  pci_dss: new PciDssGame(),
  quishing_mfa: new QuishingMfaGame(),
  bec_fraud: new BecFraudGame(),
  remote_vpn: new RemoteVpnGame()
};

window.games = games;
