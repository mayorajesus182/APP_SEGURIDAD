/**
 * Academia CiberSegura Corporación Suiche 7B - Games Data & Interaction Logic (Fase 1 + Fase 2)
 * Fase 1 (Básico): Phishing Detective, Oficina Segura, Alerta de Vishing y SMS, Fuerza Bruta, Trampas con USB.
 * Fase 2 (Especialista Transaccional): IA Generativa (Shadow AI), PCI-DSS 4.0 Transaccional,
 * Quishing & Fatiga MFA, Fraude Ejecutivo (BEC), Teletrabajo & Redes Wi-Fi (Evil Twin).
 */

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

    this.dataItems.forEach(item => {
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

    node.options.forEach((opt, idx) => {
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

    const metCount = Object.values(rules).filter(Boolean).length;

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
          { text: "🟢 Entregarla de inmediato a la Gerencia de Seguridad de la Información sin conectarla", isCorrect: true },
          { text: "🟡 Insertarla en tu computador Corporativo para abrir el archivo y buscar el dueño", isCorrect: false },
          { text: "🔴 Formatear la memoria USB en tu computador Corporativo para usarla como almacenamiento personal", isCorrect: false }
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
          { text: "🟢 Indicarle amablemente un tomacorriente de pared y negarle la conexión a tu puerto USB", isCorrect: true },
          { text: "🟡 Permitirle conectar su celular en tu computador Corporativo mientras vigilas la pantalla", isCorrect: false },
          { text: "🔴 Prestarle tu computador Corporativo para que transfiera fotos de su trabajo", isCorrect: false }
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
          { text: "🟢 Notificar a la Gerencia de Seguridad de la Información / Plataforma TI para su resguardo", isCorrect: true },
          { text: "🟡 Conectarlo en tu computador Corporativo para explorar sus carpetas e identificar a quién pertenece", isCorrect: false },
          { text: "🔴 Llevarte el disco duro a tu casa para probarlo en tu computadora personal", isCorrect: false }
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

    currentCase.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.75rem 1rem';
      btn.style.lineHeight = '1.4';
      btn.style.fontSize = '0.85rem';
      btn.textContent = opt.text;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('usb-feedback').style.display = 'none';
  }

  makeDecision(optionIdx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const currentCase = this.cases[this.currentCaseIndex];
    const selectedOption = currentCase.options[optionIdx];
    const isCorrect = selectedOption.isCorrect;

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
// FASE 2 — MÓDULO 6: IA GENERATIVA Y FUGA DE DATOS (SHADOW AI / DLP)
// ============================================================================
class AiSecurityGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        id: 1,
        context: "Depuración de Tramas del Switch Transaccional en ChatGPT Público",
        department: "Dirección Tecnología / Operaciones",
        promptText: `
          Hola IA, necesito ayuda urgente para entender por qué falla esta transacción interbancaria de Corporación Suiche 7B. Aquí te pego el volcado real de producción:
          <br><br>
          <span class="inspectable" data-clue="pan_leak">MTI=0200 | DE2(PAN)=4509128839104421 | DE35(Track2)=4509128839104421=28102019938 | DE52(PINBlock)=A8F9012B9C881102</span>
          <br><br>
          Además, nos conectamos al nodo con <span class="inspectable" data-clue="ip_leak">Usuario: srv_switch_prod / Clave: S7B_ Core_9921$ en la IP 129.1.1.85</span>. ¿Qué campo ISO-8583 está causando el rechazo RC=96?
        `,
        isSafe: false,
        clues: {
          pan_leak: {
            title: "Fuga Crítica de Datos PCI-DSS (PAN, Track2 y PIN Block)",
            text: "Subir números de tarjeta reales (PAN), datos de banda magnética (Track 2) o bloques PIN a un modelo de IA público en la nube constituye una brecha grave de seguridad y violación directa de PCI-DSS.",
            isHazard: true
          },
          ip_leak: {
            title: "Exposición de Credenciales e Infraestructura Interna",
            text: "Los prompts enviados a IAs públicas gratuitas pueden almacenarse para entrenar futuros modelos o ser revisados por terceros externos. Jamás incluyas IPs internas ni contraseñas de producción.",
            isHazard: true
          }
        },
        explanation: "<strong>¡Violación Crítica de DLP (Data Loss Prevention)!</strong> Nunca debes pegar datos reales de tarjetahabientes, tramas de producción sin anonimizar, código propietario crítico ni credenciales en chatbots de IA públicos (Shadow AI)."
      },
      {
        id: 2,
        context: "Consulta de Sintaxis General y Fórmulas de Excel Anonimizadas",
        department: "Gerencia Gestión Estratégica / Finanzas",
        promptText: `
          Hola asistente, necesito crear una macro o fórmula en Excel para consolidar una tabla de indicadores mensuales.
          <br><br>
          Las columnas tienen nombres genéricos: <span class="inspectable" data-clue="anon_data">Columna A (Fecha), Columna B (Código_Categoría), Columna C (Porcentaje_Disponibilidad)</span>.
          <br><br>
          ¿Puedes darme una fórmula con <span class="inspectable" data-clue="formula_req">SUMAR.SI.CONJUNTO y Manejo de Errores SI.ERROR</span> sin utilizar datos reales de la empresa?
        `,
        isSafe: true,
        clues: {
          anon_data: {
            title: "Estructura Anonimizada y Genérica",
            text: "El colaborador únicamente describe la estructura de columnas abstractas sin revelar cifras financieras, nombres de bancos afiliados ni datos personales.",
            isHazard: false
          },
          formula_req: {
            title: "Consulta Técnica Estándar",
            text: "Usar IA como apoyo para aprender fórmulas de ofimática o sintaxis estándar sin exponer datos confidenciales de Suiche 7B es una práctica segura.",
            isHazard: false
          }
        },
        explanation: "<strong>Uso Seguro de IA Generativa.</strong> La consulta no incluye ningún dato confidencial, financiero ni personal de Corporación Suiche 7B. Siempre abstrae y anonimiza cualquier problema antes de consultar fuentes externas."
      },
      {
        id: 3,
        context: "Resumen de Acta Confidencial de Comité de Riesgos y Auditoría SUDEBAN",
        department: "Oficial de Cumplimiento / Comité de Riesgos",
        promptText: `
          Por favor resume en 5 puntos ejecutivos el siguiente documento adjunto para mi presentación de hoy:
          <br><br>
          📄 <span class="inspectable" data-clue="doc_leak">Acta_Confidencial_Riesgos_SUDEBAN_Suiche7B.docx</span>
          <br><br>
          "En la revisión interna se detectaron <span class="inspectable" data-clue="vuln_leak">3 vulnerabilidades críticas pendientes de parcheo en el firewall perimetral y observaciones regulatorias confidenciales</span> que deben subsanarse antes del cierre trimestral..."
        `,
        isSafe: false,
        clues: {
          doc_leak: {
            title: "Carga de Documentos Internos Clasificados",
            text: "Subir actas de Junta Directiva, reportes de Auditoría o comunicaciones regulatorias de SUDEBAN a herramientas externas transfiere información estratégica fuera del control de la Corporación.",
            isHazard: true
          },
          vuln_leak: {
            title: "Divulgación de Vulnerabilidades Técnicas",
            text: "Exponer debilidades o hallazgos de auditoría de seguridad en plataformas de terceros representa un riesgo altísimo de inteligencia para atacantes.",
            isHazard: true
          }
        },
        explanation: "<strong>Riesgo Alto de Fuga Documental.</strong> Las actas de Comité de Riesgos, hallazgos de auditoría de sistemas y reportes para SUDEBAN son estrictamente confidenciales y jamás deben procesarse en servicios de IA o traductores externos no autorizados."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.renderCase();
  }

  renderCase() {
    this.hasAnswered = false;
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('ai-case-index').textContent = this.currentCaseIndex + 1;
    document.getElementById('ai-case-total').textContent = this.cases.length;
    document.getElementById('ai-context-title').textContent = c.context;
    document.getElementById('ai-dept-badge').textContent = c.department;
    document.getElementById('ai-prompt-content').innerHTML = c.promptText;

    document.getElementById('ai-feedback').style.display = 'none';
    document.getElementById('ai-actions').style.display = 'flex';

    document.getElementById('ai-clue-title').textContent = '🛡️ Escáner DLP de Prompts IA';
    document.getElementById('ai-clue-desc').textContent = 'Haz clic en los fragmentos subrayados del prompt para auditar si contienen datos regulados o secretos corporativos.';
    document.getElementById('ai-clue-card').className = 'current-clue-card';

    document.querySelectorAll('#ai_sec-view .inspectable').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const clueKey = el.getAttribute('data-clue');
        const clue = c.clues && c.clues[clueKey];
        if (!clue) return;
        app.playAudio('click');
        document.getElementById('ai-clue-title').textContent = clue.title;
        document.getElementById('ai-clue-desc').textContent = clue.text;
        document.getElementById('ai-clue-card').className = clue.isHazard ? 'current-clue-card hazard' : 'current-clue-card';
      });
    });
  }

  makeDecision(markedSafe) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const isCorrect = (markedSafe === c.isSafe);

    document.getElementById('ai-actions').style.display = 'none';
    const fb = document.getElementById('ai-feedback');
    fb.style.display = 'block';

    const statusEl = document.getElementById('ai-feedback-status');
    const descEl = document.getElementById('ai-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'ai_sec');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '✅ ¡Auditoría DLP Correcta! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'ai_sec');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Error de Clasificación DLP (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('ai-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Caso →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      app.markModuleCompleted('ai_sec');
      app.showModalAlert({
        title: '🤖 Módulo IA Generativa Segura Completado',
        message: 'Has dominado las políticas de prevención de fuga de datos (DLP) frente al uso de Inteligencia Artificial (Shadow AI) en Corporación Suiche 7B.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 7: PCI-DSS 4.0 Y DATOS DE TARJETAHABIENTES
// ============================================================================
class PciDssGame {
  constructor() {
    this.items = [
      {
        id: 'pan_mask',
        name: 'Enmascaramiento de PAN en Pantallas (BIN + 4 últimos)',
        desc: 'Mostrar únicamente los primeros 6 y últimos 4 dígitos de la tarjeta (ej. 450912******4421) en reportes y consultas operativas.',
        category: 'compliant',
        explanation: 'PCI-DSS 4.0 Requisito 3.4 exige enmascarar el PAN para que solo el personal con necesidad legítima de negocio vea más de los primeros 6 y últimos 4 dígitos.'
      },
      {
        id: 'cvv_storage',
        name: 'Guardar CVV2 / CVC2 en Logs de Auditoría Post-Autorización',
        desc: 'Almacenar temporalmente los 3 dígitos de seguridad del reverso de la tarjeta en una tabla o archivo log para reclamos.',
        category: 'violation',
        explanation: '¡Violación Crítica PCI-DSS Requisito 3.3! Los datos sensibles de autenticación (SAD: CVV2, Track 2, PIN) JAMÁS pueden almacenarse después de la autorización, ni siquiera cifrados.'
      },
      {
        id: 'hsm_pin',
        name: 'Procesamiento de PIN Block dentro de Módulo Criptográfico HSM',
        desc: 'Traducir y validar bloques PIN exclusivamente dentro de módulos de seguridad de hardware (HSM) certificados FIPS 140-2/3.',
        category: 'compliant',
        explanation: 'En un switch transaccional como Suiche 7B, los PIN de cajeros y puntos de venta nunca deben existir en texto claro fuera del HSM.'
      },
      {
        id: 'pan_whatsapp',
        name: 'Enviar Captura con PAN Completo por Chat para Conciliación',
        desc: 'Compartir por mensajería instantánea o correo sin cifrar una foto o listado Excel con números completos de tarjetas de clientes.',
        category: 'violation',
        explanation: 'PCI-DSS Requisito 4.2 prohíbe estrictamente enviar números de cuenta primarios (PAN) sin proteger mediante tecnologías de mensajería de usuario final (chats, correos).'
      },
      {
        id: 'track2_db',
        name: 'Retener Banda Magnética Completa (Track 2) en Base de Datos QA',
        desc: 'Copiar tramas reales con el Track 2 completo del ambiente de producción hacia el servidor de pruebas de desarrollo.',
        category: 'violation',
        explanation: 'Prohibido por PCI-DSS 4.0 (Requisitos 3.3 y 6.5.5): Nunca se debe almacenar Track 2 ni utilizar datos reales de producción (PAN vivos) en ambientes de prueba o desarrollo.'
      },
      {
        id: 'synthetic_qa',
        name: 'Uso de Tarjetas de Prueba Ficticias en Ambientes de Certificación',
        desc: 'Ejecutar todas las pruebas de integración interbancaria usando numeraciones de tarjetas simuladas y llaves criptográficas de prueba.',
        category: 'compliant',
        explanation: 'Excelente práctica PCI-DSS: Los entornos de desarrollo y certificación deben estar 100% segregados de producción y operar solo con datos ficticios.'
      }
    ];
    this.placedCount = 0;
  }

  init() {
    this.placedCount = 0;
    document.getElementById('pcidss-compliant-items').innerHTML = '';
    document.getElementById('pcidss-violation-items').innerHTML = '';
    document.getElementById('pcidss-completion-feedback').style.display = 'none';
    document.getElementById('pcidss-items-list').style.display = 'grid';
    this.renderItems();
  }

  renderItems() {
    const list = document.getElementById('pcidss-items-list');
    list.innerHTML = '';

    this.items.forEach(item => {
      list.innerHTML += `
        <div class="pci-data-card" id="pcidss-card-${item.id}">
          <div class="pci-data-desc">
            <span class="pci-data-title">${item.name}</span>
            <span class="pci-data-hint">${item.desc}</span>
          </div>
          <div style="display:flex; gap:0.4rem; margin-top:0.6rem;">
            <button class="btn btn-secondary" style="padding:0.35rem 0.5rem; font-size:0.72rem; flex:1;" onclick="games.pci_dss.classifyItem('${item.id}', 'compliant')">🟢 Cumple PCI-DSS 4.0</button>
            <button class="btn btn-secondary" style="padding:0.35rem 0.5rem; font-size:0.72rem; flex:1;" onclick="games.pci_dss.classifyItem('${item.id}', 'violation')">🔴 Violación PCI-DSS</button>
          </div>
        </div>
      `;
    });
  }

  classifyItem(itemId, chosenCategory) {
    const item = this.items.find(i => i.id === itemId);
    const card = document.getElementById(`pcidss-card-${itemId}`);
    if (!item || !card) return;

    const isCorrect = (item.category === chosenCategory);
    card.remove();

    const targetContainer = document.getElementById(`pcidss-${chosenCategory}-items`);
    const statusIcon = isCorrect ? '✅' : '❌';
    const borderStyle = isCorrect ? 'border-color:rgba(57,255,20,0.35);' : 'border-color:rgba(214,26,39,0.45);';

    targetContainer.innerHTML += `
      <div class="dropped-tag" style="${borderStyle}">
        <span>${statusIcon} ${item.name}</span>
      </div>
    `;

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(25, true, 'pci_dss');
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'pci_dss');
      app.showModalAlert({
        title: '💳 Normativa PCI-DSS 4.0 — Observación de Auditoría',
        message: `Clasificación incorrecta para <strong>"${item.name}"</strong>.<br><br>${item.explanation}`,
        type: 'danger'
      });
    }

    this.placedCount++;
    if (this.placedCount === this.items.length) {
      app.playAudio('complete');
      app.markModuleCompleted('pci_dss');
      document.getElementById('pcidss-items-list').style.display = 'none';
      document.getElementById('pcidss-completion-feedback').style.display = 'block';
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 8: QUISHING (QR FALSOS) Y FATIGA DE MFA (PUSH BOMBING)
// ============================================================================
class QuishingMfaGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        title: "Bombardeo Nocturno de Notificaciones Push 2FA (MFA Fatigue)",
        badge: "Autenticación Multifactor (MFA)",
        visualIcon: "📲",
        visualTitle: "Solicitud Push #7: Aprobar Inicio de Sesión",
        visualMeta: "Hora: 11:48 PM | Origen: IP Externa No Reconocida | Dispositivo: Windows 11",
        scenarioDesc: "Estás en tu casa a las 11:48 PM sin usar la computadora. Tu celular corporativo empieza a vibrar con 7 notificaciones seguidas de Microsoft Authenticator / VPN pidiendo que presiones 'APROBAR' para iniciar sesión. ¿Qué está ocurriendo y cómo debes actuar?",
        options: [
          { text: "🚨 Rechazar la solicitud ('No fui yo') y reportar compromiso de contraseña a Seguridad de la Información", isCorrect: true },
          { text: "🟡 Presionar 'Aprobar' una sola vez para que el teléfono deje de sonar y poder dormir", isCorrect: false },
          { text: "🔴 Desinstalar la aplicación de doble factor del teléfono para detener las alertas", isCorrect: false }
        ],
        explanation: "Esto es un ataque de <strong>Fatiga de MFA (Push Bombing)</strong>. El atacante ya conoce tu contraseña y envía decenas de notificaciones esperando que apruebes una por cansancio o error. Si recibes un Push que tú no iniciaste, significa que tu contraseña está comprometida: debes presionar <strong>Denegar</strong> y cambiar tu clave de inmediato."
      },
      {
        title: "Cartel con Código QR para 'Actualización de Beneficios Corporativos' (Quishing)",
        badge: "Inspección de Código QR",
        visualIcon: "🏁",
        visualTitle: "QR Escaneado: http://suiche7b-login.auth-ve.xyz/sso",
        visualMeta: "Ubicación del QR: Correo externo sin firma digital / Volante impreso",
        scenarioDesc: "Recibes un correo con un código QR gigante que dice: 'Por nuevas políticas, escanea este QR desde tu celular personal para evitar que el filtro de red bloquee la actualización de tu bono de alimentación'. Al previsualizar la URL del QR en tu cámara, apunta a 'suiche7b-login.auth-ve.xyz'. ¿Qué haces?",
        options: [
          { text: "🚨 No ingresar credenciales y reportar el correo como ataque de Quishing (QR Phishing)", isCorrect: true },
          { text: "🟡 Ingresar tu usuario y clave de red desde el celular porque los códigos QR no tienen virus", isCorrect: false },
          { text: "🔴 Reenviar el código QR por el grupo de WhatsApp del departamento para que todos prueben", isCorrect: false }
        ],
        explanation: "El <strong>Quishing (Phishing mediante códigos QR)</strong> busca trasladar al empleado de su computadora protegida hacia su teléfono móvil para robarle las credenciales en un dominio falso (`.auth-ve.xyz`). Siempre verifica la URL completa antes de interactuar con cualquier QR."
      },
      {
        title: "Validación MFA con Número de Coincidencia Iniciada por Ti",
        badge: "Verificación Legítima",
        visualIcon: "🔐",
        visualTitle: "Código en Pantalla: [ 84 ] — Ingresa este número en tu App",
        visualMeta: "Hora: 09:05 AM | Origen: Portal Interno https://academiasi.suiche7b.com",
        scenarioDesc: "Acabas de escribir tu usuario y contraseña en tu computadora de oficina a las 9:05 AM para entrar al portal corporativo oficial y la pantalla te muestra el número '84'. Instantáneamente tu app de autenticación te pide escribir el número que ves en pantalla. ¿Es seguro aprobar?",
        options: [
          { text: "🟢 Sí, ingresar el número 84 porque la solicitud fue iniciada por mí en este exacto segundo y en el dominio oficial", isCorrect: true },
          { text: "🟡 Rechazar todas las solicitudes MFA aunque yo mismo esté intentando iniciar sesión", isCorrect: false },
          { text: "🔴 Enviar captura del número 84 por correo a soporte técnico para que ellos entren por mí", isCorrect: false }
        ],
        explanation: "<strong>Autenticación MFA Segura (Number Matching).</strong> Cuando tú mismo acabas de iniciar sesión en el sitio oficial HTTPS y el código numérico coincide con tu pantalla, es seguro completar el segundo factor."
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

    document.getElementById('qmfa-case-counter').textContent = `Caso ${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('qmfa-scenario-title').textContent = c.title;
    document.getElementById('qmfa-scenario-desc').textContent = c.scenarioDesc;
    document.getElementById('qmfa-visual-icon').textContent = c.visualIcon;
    document.getElementById('qmfa-visual-title').textContent = c.visualTitle;
    document.getElementById('qmfa-visual-meta').textContent = c.visualMeta;

    const container = document.getElementById('qmfa-options-container');
    container.innerHTML = '';
    c.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.75rem 1rem';
      btn.style.lineHeight = '1.4';
      btn.style.fontSize = '0.85rem';
      btn.textContent = opt.text;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('qmfa-feedback').style.display = 'none';
  }

  makeDecision(idx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const isCorrect = c.options[idx].isCorrect;

    const fb = document.getElementById('qmfa-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('qmfa-feedback-status');
    const descEl = document.getElementById('qmfa-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'quishing_mfa');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '🛡️ ¡Decisión MFA/QR Correcta! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'quishing_mfa');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Riesgo de Secuestro de Sesión (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('qmfa-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Caso →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      app.markModuleCompleted('quishing_mfa');
      app.showModalAlert({
        title: '📲 Módulo Quishing y Fatiga MFA Completado',
        message: 'Excelente. Ahora sabes cómo defender tu segundo factor de autenticación (2FA) frente a bombardeos Push y códigos QR maliciosos.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 9: FRAUDE EJECUTIVO (BEC / WHALING) Y PROVEEDORES
// ============================================================================
class BecFraudGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        title: "Solicitud Urgente de 'Presidencia Ejecutiva' Fuera de Horario (Whaling)",
        sender: "presidencia.suiche7b@ejecutivo-corporativo.com",
        subject: "CONFIDENCIAL: Adquisición Estratégica — Pago de Garantía Tecnológica Hoy",
        scenarioDesc: "Son las 4:40 PM de un viernes. Recibes un correo marcado como 'Estrictamente Confidencial' que aparenta venir de Presidencia Ejecutiva: 'Estoy entrando a una reunión con la Junta Directiva y no puedo atender llamadas. Necesito que proceses hoy mismo el pago de anticipo por $45,000 (o su equivalente) a esta nueva cuenta de un proveedor internacional de ciberseguridad sin pasarlo aún por el circuito normal de firmas para evitar filtraciones'. ¿Cómo procedes?",
        options: [
          { text: "🟢 Detener la operación, verificar el dominio del remitente y validar por un canal oficial independiente (extensión interna) cumpliendo el control de doble firma", isCorrect: true },
          { text: "🟡 Ejecutar la transferencia de inmediato por tratarse de una orden directa de Presidencia Ejecutiva", isCorrect: false },
          { text: "🔴 Responder al mismo correo preguntando si de verdad es el Presidente Ejecutivo", isCorrect: false }
        ],
        explanation: "El <strong>Fraude del CEO (Business Email Compromise / Whaling)</strong> utiliza la autoridad de altos directivos, el secreto ('no comentes con nadie') y la presión de tiempo ('no puedo atender llamadas') para lograr que el personal salte los controles internos. <strong>Ningún ejecutivo de Suiche 7B solicitará omitir los controles de autorización dual ni pagos desde dominios externos.</strong>"
      },
      {
        title: "Cambio de Cuenta Bancaria de Proveedor Tecnológico Conocido",
        sender: "cobranzas@proveedor-fibra.com.ve (Cuenta de proveedor comprometida)",
        subject: "Actualización de Coordenadas Bancarias — Factura Mensual Enlace Principal",
        scenarioDesc: "Un proveedor legítimo de telecomunicaciones escribe desde su correo habitual informando que, por 'auditoría bancaria', cambiaron su cuenta receptora y adjunta una carta PDF solicitando que el pago de este mes se deposite en una cuenta a nombre de una empresa distinta. ¿Cuál es el protocolo obligatorio?",
        options: [
          { text: "🟢 No modificar los datos maestros del proveedor hasta realizar verificación telefónica cruzada (Out-of-Band) llamando al número registrado originalmente en el contrato", isCorrect: true },
          { text: "🟡 Actualizar la cuenta bancaria en el sistema administrativo porque el correo vino de la dirección real del proveedor", isCorrect: false },
          { text: "🔴 Llamar al número telefónico nuevo que aparece impreso dentro del mismo PDF sospechoso", isCorrect: false }
        ],
        explanation: "En ataques de <strong>Compromiso de Cuenta de Proveedor (Vendor Email Compromise)</strong>, los criminales hackean el correo real de un proveedor de Suiche 7B y envían instrucciones de pago alteradas. Siempre se debe validar cualquier cambio de cuenta llamando al contacto histórico registrado en el expediente original, nunca al número del correo recibido."
      },
      {
        title: "Suplantación de Inspector de SUDEBAN Solicitando Accesos Remotos",
        sender: "inspeccion.tecnica@sudeban-auditoria.org",
        subject: "Requerimiento Inmediato: Instalación de Agente de Supervisión Remota",
        scenarioDesc: "Recibes un correo que exige instalar una herramienta de escritorio remoto (AnyDesk / TeamViewer) en tu estación de trabajo en los próximos 30 minutos para una 'inspección en vivo de SUDEBAN', amenazando con multas regulatorias. ¿Qué debes hacer?",
        options: [
          { text: "🟢 No instalar ningún software, reportar a la Gerencia de Seguridad de la Información y al Oficial de Cumplimiento", isCorrect: true },
          { text: "🟡 Descargar e instalar AnyDesk rápidamente para colaborar con el supuesto ente regulador", isCorrect: false },
          { text: "🔴 Entregarle las credenciales de solo lectura del servidor para no instalar programas", isCorrect: false }
        ],
        explanation: "Los entes reguladores como <strong>SUDEBAN jamás solicitan a colaboradores individuales la instalación de herramientas de control remoto (RAT/AnyDesk)</strong> por correo electrónico ni desde dominios `.org` no gubernamentales. Toda comunicación regulatoria se canaliza exclusivamente a través del Oficial de Cumplimiento y Presidencia."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    document.getElementById('bec-feedback').style.display = 'none';
    this.renderCase();
  }

  renderCase() {
    this.hasAnswered = false;
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('bec-case-counter').textContent = `Caso ${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('bec-scenario-title').textContent = c.title;
    document.getElementById('bec-sender').textContent = c.sender;
    document.getElementById('bec-subject').textContent = c.subject;
    document.getElementById('bec-scenario-desc').textContent = c.scenarioDesc;

    const container = document.getElementById('bec-options-container');
    container.innerHTML = '';
    c.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.75rem 1rem';
      btn.style.lineHeight = '1.4';
      btn.style.fontSize = '0.85rem';
      btn.textContent = opt.text;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('bec-feedback').style.display = 'none';
  }

  makeDecision(idx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const isCorrect = c.options[idx].isCorrect;

    const fb = document.getElementById('bec-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('bec-feedback-status');
    const descEl = document.getElementById('bec-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'bec_fraud');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '🏛️ ¡Control Antifraude Correcto! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'bec_fraud');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Alerta de Fraude Corporativo BEC (0 PTS)';
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
      app.markModuleCompleted('bec_fraud');
      app.showModalAlert({
        title: '🏛️ Módulo Fraude Ejecutivo (BEC) Completado',
        message: 'Has completado el entrenamiento contra suplantación de alta gerencia, fraude a proveedores y falsas inspecciones regulatorias.',
        type: 'success'
      }).then(() => app.navigateTo('dashboard'));
    }
  }
}

// ============================================================================
// FASE 2 — MÓDULO 10: TELETRABAJO SEGURO, VPN Y REDES WI-FI (EVIL TWIN)
// ============================================================================
class RemoteVpnGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        title: "Detección de Red Wi-Fi Gemela Maliciosa (Evil Twin) Fuera de la Oficina",
        networkBadge: "Escáner de Redes Inalámbricas",
        ssid: "WiFi_Gratis_Aeropuerto_VIP (Abierta / Sin Cifrado)",
        securitySpec: "Cifrado: NINGUNO | Portal Cautivo solicita correo corporativo",
        scenarioDesc: "Debes conectarte de emergencia desde tu laptop corporativa para revisar un reporte de Corporación Suiche 7B mientras estás fuera de la sede. Ves una red abierta sin contraseña llamada 'WiFi_Gratis_Aeropuerto_VIP'. ¿Cuál es el procedimiento seguro?",
        options: [
          { text: "🟢 No conectarse a la red Wi-Fi abierta; utilizar datos móviles cifrados (Hotspot personal con WPA2/WPA3) y activar inmediatamente el túnel VPN corporativo", isCorrect: true },
          { text: "🟡 Conectarse al Wi-Fi gratis abierto porque el navegador tiene candado HTTPS y eso basta", isCorrect: false },
          { text: "🔴 Desactivar el Firewall de Windows para que el portal del aeropuerto cargue más rápido", isCorrect: false }
        ],
        explanation: "Las redes Wi-Fi públicas o sin contraseña suelen utilizarse para ataques <strong>Evil Twin (Gemelo Malvado) y Man-in-the-Middle</strong>, donde un atacante intercepta el tráfico DNS y sesiones. Siempre utiliza una conexión confiable y levanta la <strong>VPN oficial de Corporación Suiche 7B</strong>."
      },
      {
        title: "Prevención de Espionaje Visual (Shoulder Surfing) y Uso de Equipos en Casa",
        networkBadge: "Entorno de Teletrabajo",
        ssid: "Hogar_Fibra_5G (WPA3) + VPN Suiche 7B Activa",
        securitySpec: "Estado: Sesión Remota Abierta en Sala Compartida",
        scenarioDesc: "Estás trabajando de forma remota con la VPN activa. Un familiar o visita en casa te pide usar tu laptop de Corporación Suiche 7B durante 15 minutos para descargar e imprimir un archivo de la universidad. ¿Qué indica la política de seguridad?",
        options: [
          { text: "🟢 Negar el uso del equipo corporativo a terceros o familiares y bloquear la pantalla (Win + L) siempre que te separes de la laptop", isCorrect: true },
          { text: "🟡 Prestarle la laptop corporativa pero cerrando antes la ventana del correo electrónico", isCorrect: false },
          { text: "🔴 Crear una carpeta en el escritorio corporativo para que tu familiar descargue sus programas allí", isCorrect: false }
        ],
        explanation: "Los equipos portátiles asignados por <strong>Corporación Suiche 7B son de uso estrictamente laboral e intransferible</strong>. Un tercero o familiar puede descargar accidentalmente troyanos o infostealers en una sesión que tiene túnel VPN directo hacia la red interna de la empresa."
      },
      {
        title: "Sincronización de Archivos Confidenciales en Nubes Personales",
        networkBadge: "Control de Almacenamiento en la Nube",
        ssid: "Transferencia de Archivos de Trabajo",
        securitySpec: "Destino detectado: Google Drive / Dropbox / WhatsApp Personal",
        scenarioDesc: "Para avanzar un trabajo el fin de semana desde tu computadora personal de casa, piensas subir una base de datos de clientes y reportes operativos de Suiche 7B a tu cuenta personal de Google Drive o enviártelos a tu correo personal `@gmail.com`. ¿Es válido?",
        options: [
          { text: "🟢 Prohibido: La información de Corporación Suiche 7B solo debe almacenarse y transmitirse en los repositorios y equipos corporativos autorizados", isCorrect: true },
          { text: "🟡 Es válido siempre y cuando borres el archivo de tu Gmail el lunes por la mañana", isCorrect: false },
          { text: "🔴 Es válido si le pones de nombre 'archivo_personal.xlsx' para que nadie sospeche", isCorrect: false }
        ],
        explanation: "Enviar información corporativa a correos personales (`@gmail`, `@hotmail`) o nubes personales no administradas constituye una <strong>exfiltración no autorizada de datos</strong> y viola las políticas de seguridad de la información de Corporación Suiche 7B."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    document.getElementById('vpn-feedback').style.display = 'none';
    this.renderCase();
  }

  renderCase() {
    this.hasAnswered = false;
    const c = this.cases[this.currentCaseIndex];

    document.getElementById('vpn-case-counter').textContent = `Caso ${this.currentCaseIndex + 1} de ${this.cases.length}`;
    document.getElementById('vpn-scenario-title').textContent = c.title;
    document.getElementById('vpn-ssid').textContent = c.ssid;
    document.getElementById('vpn-spec').textContent = c.securitySpec;
    document.getElementById('vpn-scenario-desc').textContent = c.scenarioDesc;

    const container = document.getElementById('vpn-options-container');
    container.innerHTML = '';
    c.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.textAlign = 'left';
      btn.style.padding = '0.75rem 1rem';
      btn.style.lineHeight = '1.4';
      btn.style.fontSize = '0.85rem';
      btn.textContent = opt.text;
      btn.onclick = () => this.makeDecision(idx);
      container.appendChild(btn);
    });

    document.getElementById('vpn-feedback').style.display = 'none';
  }

  makeDecision(idx) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;

    const c = this.cases[this.currentCaseIndex];
    const isCorrect = c.options[idx].isCorrect;

    const fb = document.getElementById('vpn-feedback');
    fb.style.display = 'block';
    const statusEl = document.getElementById('vpn-feedback-status');
    const descEl = document.getElementById('vpn-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true, 'remote_vpn');
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = '🌐 ¡Conexión y Perímetro Protegido! (+50 PTS)';
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false, 'remote_vpn');
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = '🚨 Brecha en Seguridad Remota (0 PTS)';
    }

    descEl.innerHTML = c.explanation;
    document.getElementById('vpn-next-btn').textContent =
      this.currentCaseIndex === this.cases.length - 1 ? 'Finalizar Módulo' : 'Siguiente Caso →';
  }

  nextCase() {
    app.playAudio('click');
    if (this.currentCaseIndex < this.cases.length - 1) {
      this.currentCaseIndex++;
      this.renderCase();
    } else {
      app.markModuleCompleted('remote_vpn');
      app.showModalAlert({
        title: '🌐 Módulo Teletrabajo y VPN Completado',
        message: 'Has completado exitosamente el entrenamiento sobre redes Wi-Fi seguras, túneles VPN y protección de activos fuera de la oficina.',
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
  // Fase 2 (Avanzado / Transaccional)
  ai_sec: new AiSecurityGame(),
  pci_dss: new PciDssGame(),
  quishing_mfa: new QuishingMfaGame(),
  bec_fraud: new BecFraudGame(),
  remote_vpn: new RemoteVpnGame()
};

window.games = games;
