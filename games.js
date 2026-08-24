/**
 * Academia CiberSegura Corporación Suiche 7B - Games Data & Interaction Logic
 * Contiene la lógica para Phishing Detective, Oficina Segura, Alerta de Vishing y SMS, Fuerza Bruta y Trampas con USB/Dispositivos.
 */

class PhishingGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.selectedClueId = null;
    this.hasAnswered = false;

    // Bancos de Casos - Simplificados y Altamente Didácticos para personal administrativo
    this.cases = [
      {
        id: 1,
        from: "soporte-ti@suiche7b-ve.com",
        subject: "🚨 URGENTE: Bloqueo de cuenta inminente por actualización de seguridad",
        body: `
          Estimado Colaborador de Corporación Suiche 7B,
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
          Estimado cliente de Corporación Suiche 7B,
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
          Estimado Equipo de Corporación Suiche 7B,
          <br><br>
          Como parte de nuestros planes preventivos y normativas de seguridad física industrial, el próximo martes 26 de mayo a las 10:00 AM realizaremos nuestro <strong>Simulacro Anual de Evacuación</strong> en la sede principal de Caracas.
          <br><br>
          La participación de todo el personal de Finanzas, Administración y Operaciones es obligatoria para validar nuestros tiempos de respuesta en contingencias.
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
        explanation: "Este correo es <strong>SEGURO</strong>. Es una comunicación interna estándar de Recursos Humanos. El remitente utiliza el dominio real de la empresa ('@suiche7b.com.ve'), no genera pánico irracional y el enlace dirige a la intranet segura mediante HTTPS."
      }
    ];
  }

  init() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;
    this.selectedClueId = null;
    
    // Ocultar feedback
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
    
    // Ocultar overlay de feedback
    document.getElementById('phishing-feedback').style.display = 'none';
    document.getElementById('phishing-actions').style.display = 'flex';

    // Reset de la tarjeta de lupa
    document.getElementById('clue-title-text').textContent = '🔬 Lupa de Hacking Ético';
    document.getElementById('clue-desc-text').textContent = 'Haz clic sobre los elementos subrayados en azul en el correo para analizarlos y buscar anomalías.';
    document.getElementById('clue-display-card').className = 'current-clue-card';

    // Añadir eventos a los elementos inspectables del cuerpo
    const inspectables = document.querySelectorAll('.inspectable');
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
    const clue = currentCase.clues[clueId];
    
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

    // Ocultar botones de acción y mostrar feedback
    document.getElementById('phishing-actions').style.display = 'none';
    const feedbackOverlay = document.getElementById('phishing-feedback');
    feedbackOverlay.style.display = 'block';

    const statusEl = document.getElementById('phishing-feedback-status');
    const descEl = document.getElementById('phishing-feedback-desc');

    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(50, true);
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ¡Excelente Decisión! (+50 PTS)
      `;
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false);
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

    // Cambiar texto de botón final
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
      // Fin del juego
      app.markModuleCompleted('phishing');
      app.showModalAlert({
        title: '🏆 Módulo Phishing Detective Completado',
        message: '¡Excelente trabajo! Has analizado todos los correos del simulador con éxito. Has aprendido a identificar dominios suplantados, enlaces dudosos y archivos adjuntos peligrosos en la red de Corporación Suiche 7B.',
        type: 'success'
      }).then(() => {
        app.navigateTo('dashboard');
      });
    }
  }
}

class PciGame {
  constructor() {
    // Reemplazado por Oficina Segura (Clean Desk)
    this.dataItems = [
      { id: 'postit', name: 'Post-it con Contraseña', desc: 'Nota física en el monitor con clave secreta de red.', category: 'forbidden' },
      { id: 'lockpc', name: 'Bloqueo de PC (Win + L)', desc: 'Bloquear sistema al apartarse temporalmente del puesto.', category: 'safe' },
      { id: 'idcard', name: 'Carnet de Acceso en Mesa', desc: 'Dejar el carnet inteligente sobre la mesa al almorzar.', category: 'forbidden' },
      { id: 'shredder', name: 'Triturado de Documentos', desc: 'Destrucción inmediata de reportes interbancarios obsoletos.', category: 'safe' },
      { id: 'usbunknown', name: 'Conectar USB Encontrado', desc: 'Insertar pendrive ajeno para averiguar de quién es.', category: 'forbidden' },
      { id: 'cloudsave', name: 'Almacenar en Nube Corporativa', desc: 'Guardar archivos de trabajo en SharePoint/OneDrive oficial.', category: 'safe' }
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
            <!-- Botones de click para usabilidad móvil / accesibilidad -->
            <button class="btn btn-secondary" style="padding:0.3rem 0.5rem; font-size:0.7rem; flex:1;" onclick="games.pci.moveItem('${item.id}', 'safe')" title="Mover a Bóveda Segura">🟢 Segura</button>
            <button class="btn btn-secondary" style="padding:0.3rem 0.5rem; font-size:0.7rem; flex:1;" onclick="games.pci.moveItem('${item.id}', 'forbidden')" title="Mover a Prohibida">🔴 Infracción</button>
          </div>
        </div>
      `;
    });
  }

  // --- HTML5 DRAG & DROP LOGIC ---
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

  // Lógica principal de asignación
  moveItem(itemId, targetVaultId) {
    const item = this.dataItems.find(i => i.id === itemId);
    const card = document.getElementById(`pci-card-${itemId}`);

    if (!item || !card) return;

    // Verificar si la respuesta es correcta
    const isCorrect = (item.category === targetVaultId);
    
    // Remover de la lista inicial
    card.remove();

    // Crear elemento visual en la bóveda
    const vaultContainer = document.getElementById(`vault-${targetVaultId}-items`);
    const statusIcon = isCorrect ? '✅' : '❌';
    const tagClass = isCorrect ? 'style="border-color:rgba(57,255,20,0.3);"' : 'style="border-color:rgba(214,26,39,0.3);"';

    vaultContainer.innerHTML += `
      <div class="dropped-tag" ${tagClass} title="${isCorrect ? 'Clasificación correcta' : 'Alerta de Infracción'}">
        <span>${statusIcon} ${item.name}</span>
      </div>
    `;

    // Procesar puntos
    if (isCorrect) {
      app.playAudio('correct');
      app.addPoints(20, true);
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false);
      app.showModalAlert({
        title: '⚠️ Alerta de Hábito Inadecuado',
        message: `La acción <strong>"${item.name}"</strong> representa un riesgo potencial en el espacio físico de Corporación Suiche 7B.<br><br>Los atacantes aprovechan descuidos en el puesto de trabajo (como post-its con claves o laptops desbloqueadas) para obtener acceso no autorizado.`,
        type: 'danger'
      });
    }

    this.placedCount++;

    // Verificar si terminó el juego
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
      <strong>Lección Aprendida sobre Escritorio Limpio (Clean Desk):</strong> 
      En <strong>Corporación Suiche 7B</strong>, la ciberseguridad empieza en nuestro espacio físico de trabajo. Triturar documentos sensibles, no anotar claves en post-its corporativos, guardar la tarjeta inteligente de acceso y bloquear la computadora con **Win + L** de inmediato previene el espionaje de pasillo u obtención de credenciales no autorizadas.
    `;
  }
}

class IncidentGame {
  constructor() {
    this.metrics = {
      integrity: 100,
      trust: 100,
      uptime: 100
    };

    // Árbol de historia interactiva de Vishing y SMS corporativos
    this.nodes = {
      start: {
        text: "Es un viernes por la tarde en Corporación Suiche 7B. Recibes un mensaje de WhatsApp urgente de un número con el imagotipo corporativo: 'Hola, soy Carlos de Soporte TI. Hacemos mantenimiento imprevisto del switch interbancario de Corporación Suiche 7B. Te llegó un SMS de 6 dígitos para validar tu perfil, por favor reenvíamelo rápido para no suspender tus accesos hoy'. ¿Qué haces?",
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
        text: "¡Excelente reflejo! Neutralizaste el hackeo del WhatsApp. Sin embargo, a los 5 minutos suena el teléfono fijo de tu oficina. Una voz profesional te dice: 'Hola, habla el Oficial de Cumplimiento de Corporación Suiche 7B. Estamos en medio de una auditoría extraordinaria y sorpresa de SUDEBAN. Léame las credenciales administrativas o los datos al reverso de su carnet de acceso físico para validar su perfil'. ¿Cuál es tu postura?",
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
        text: "El atacante se da cuenta de que intentas reportarlo. Tu celular timbra con amenazas: 'Sabemos quién eres, cooperas enviándonos una clave administrativa temporal de Corporación Suiche 7B o bloquearemos definitivamente todas tus credenciales'. ¿Qué haces?",
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
        text: "¡Falla grave! Los datos que entregaste eran para un atacante de Vishing (ingeniería social telefónica). Tu contraseña administrativa ya no funciona y tus compañeros informan que hay transferencias sospechosas en proceso. ¿Cuál es tu respuesta de urgencia?",
        logs: [
          "14:22:12 - CRÍTICO:: Cambio de credencial no autorizado en el portal administrativo.",
          "14:22:35 - ALERTA:: Transacciones transfronterizas anómalas iniciadas."
        ],
        options: [
          {
            text: "Llamar urgentemente a Seguridad Informática y Soporte TI para bloquear de inmediato tus perfiles de red corporativos.",
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
        text: "¡Felicidades! Has defendido la infraestructura de Corporación Suiche 7B con éxito absoluto. Al identificar que Soporte TI oficial de Corporación Suiche 7B jamás solicita códigos SMS, contraseñas ni datos magnéticos de carnet por canales informales (WhatsApp/Llamada), has evitado una brecha crítica.",
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
        text: "Mitigación Exitosa. Aunque caíste en la trampa inicial del estafador, tu reporte veloz de seguridad a las gerencias centrales permitió bloquear oportunamente los perfiles de red del switch financiero antes de que se concretaran desvíos monetarios.",
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
        text: "Desastre. Has cedido por completo ante la ingeniería social. El atacante posee accesos administrativos al switch de Corporación Suiche 7B, sustrajo capital de caja chica virtual y la red enfrenta auditorías de SUDEBAN con penalizaciones de telecomunicación financiera severas.",
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
    this.metrics = {
      integrity: 100,
      trust: 100,
      uptime: 100
    };
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

    // Cambiar colores dinámicamente según estado
    this.setMetricColor(intFill, this.metrics.integrity);
    this.setMetricColor(trFill, this.metrics.trust);
    this.setMetricColor(upFill, this.metrics.uptime);
  }

  setMetricColor(element, value) {
    if (value >= 75) {
      element.style.background = 'var(--accent-green)';
    } else if (value >= 40) {
      element.style.background = '#fbba0a'; // Amber
    } else {
      element.style.background = 'var(--accent-red-light)';
    }
  }

  renderNode() {
    const node = this.nodes[this.currentNodeId];
    if (!node) return;

    // Desplegar logs en la terminal
    const terminal = document.getElementById('incident-terminal-logs');
    
    // Inyectar alertas y logs con micro-retraso
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

    // Auto-scroll de consola
    terminal.scrollTop = terminal.scrollHeight;

    // Desplegar descripción
    document.getElementById('incident-story-desc').textContent = node.text;

    // Desplegar opciones
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
    
    // Aplicar puntos e impactos
    if (option.points > 0) {
      app.addPoints(option.points, true);
    }
    
    if (option.impact) {
      this.metrics.integrity = Math.max(0, Math.min(100, this.metrics.integrity + (option.impact.integrity || 0)));
      this.metrics.trust = Math.max(0, Math.min(100, this.metrics.trust + (option.impact.trust || 0)));
      this.metrics.uptime = Math.max(0, Math.min(100, this.metrics.uptime + (option.impact.uptime || 0)));
      
      // Reproducir sonido de alerta si hay impactos negativos
      if (option.impact.integrity < 0 || option.impact.trust < 0 || option.impact.uptime < 0) {
        app.playAudio('incident_alert');
      } else {
        app.playAudio('correct');
      }
    }

    this.updateMetricsUI();
    this.currentNodeId = option.next;

    // Manejar cierres de juego
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
        description = '¡Excelente! Mantuviste la confidencialidad absoluta al no divulgar claves ni SMS de un solo uso por llamadas o chats no oficiales. El switch central opera con plena confianza.';
        break;
      case 'end_recovery':
        title = '⚠️ Contención Post-Incidente';
        description = 'Caíste en los trucos telefónicos corporativos inicialmente, pero tu reporte veloz detuvo transferencias de red a tiempo. Para el futuro, verifica siempre llamando a extensiones oficiales.';
        break;
      case 'end_fail':
        title = '❌ Brecha en Ingeniería Social';
        description = 'Las decisiones que tomaste permitieron el control absoluto de tus perfiles a cibercriminales, generando fraudes interbancarios. ¡Esta simulación demuestra que las claves NUNCA se entregan!';
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

    // Reset input and rule styles
    document.getElementById('test-password').value = '';
    this.evaluatePassword('');

    // Attach resize listener
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

      this.ctx.fillStyle = '#fbba0a'; // Neon Cyan
      this.ctx.font = `${this.fontSize}px monospace`;

      this.columns.forEach(col => {
        // Draw random binary characters
        const char = Math.random() > 0.5 ? '1' : '0';
        this.ctx.fillText(char, col.x, col.y);

        // Move down
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
      symbol: /[$@#%!*?&]/.test(pwd)
    };

    // Update rule checkers UI
    this.updateRuleUI('rule-length', rules.length);
    this.updateRuleUI('rule-upper', rules.upper);
    this.updateRuleUI('rule-number', rules.number);
    this.updateRuleUI('rule-symbol', rules.symbol);

    // Calculate met count
    const metCount = Object.values(rules).filter(Boolean).length;

    // Calculate strength text & colors
    const strengthText = document.getElementById('password-strength-text');
    const bars = [
      document.getElementById('strength-bar-1'),
      document.getElementById('strength-bar-2'),
      document.getElementById('strength-bar-3'),
      document.getElementById('strength-bar-4')
    ];

    // Reset bars
    bars.forEach(b => {
      b.style.background = 'rgba(255,255,255,0.05)';
    });

    let timeText = 'Instante (Fuerza Bruta Directa) ❌';
    let statusText = '[ESTADO]: Contraseña extremadamente vulnerable a cracking.';
    this.matrixSpeed = 5; // Very fast matrix when insecure

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
      strengthText.style.color = '#fbba0a'; // Orange
      bars[0].style.background = '#fbba0a';
      bars[1].style.background = '#fbba0a';
      timeText = '2 minutos ⚠️';
      statusText = '[ESTADO]: Fuerza bruta exitosa usando un diccionario de palabras común.';
      this.matrixSpeed = 2.5;
    } else if (metCount === 3) {
      strengthText.textContent = 'Media 🟡';
      strengthText.style.color = '#eab308'; // Yellow
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
      this.matrixSpeed = 0.2; // Slow matrix to represent blocks
    }

    document.getElementById('cracking-time-value').textContent = timeText;
    document.getElementById('cracking-status-log').textContent = statusText;

    // Enable/disable finish button
    const finishBtn = document.getElementById('password-finish-btn');
    if (metCount === 4) {
      finishBtn.disabled = false;
      // Play a little lock success sound on first fully safe
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
    app.addPoints(50, true); // 50 bonus pts for safe key
    app.markModuleCompleted('password');
    app.showModalAlert({
      title: '🔑 Fortalecimiento de Clave Completado',
      message: '¡Excelente! Has configurado una contraseña robusta e inquebrantable de prueba. Recuerda aplicar estas mismas reglas de complejidad en todas tus credenciales oficiales de Corporación Suiche 7B.',
      type: 'success'
    }).then(() => {
      app.navigateTo('dashboard');
    });
  }
}

class UsbGame {
  constructor() {
    this.currentCaseIndex = 0;
    this.hasAnswered = false;

    this.cases = [
      {
        scenarioTitle: "Pendrive 'Nómina Corporación Suiche 7B' en el Pasillo",
        speech: "\"Vas caminando por el pasillo hacia la cocina o el ascensor y ves tirada en el suelo una memoria USB nueva de 64GB etiquetada con marcador: 'Nómina_Corporación Suiche 7B_2026.xlsx'. No hay nadie cerca en ese momento.\"",
        item: {
          icon: "💾",
          name: "Pendrive 'Nómina 2026'",
          location: "Pasillo Principal / Ascensores"
        },
        options: [
          { text: "🟢 Entregarla de inmediato a la Gerencia de Seguridad de la Información o TI sin conectarla", isCorrect: true },
          { text: "🟡 Insertarla en tu computadora corporativa para abrir el archivo y buscar el dueño", isCorrect: false },
          { text: "🔴 Formatear la memoria USB en tu PC de oficina para usarla como almacenamiento personal", isCorrect: false }
        ],
        explanation: "¡Excelente decisión! Las memorias USB caídas en pasillos, estacionamientos o baños suelen ser un ataque de <strong>Ingeniería Social llamado Baiting (Cebado)</strong>. Los ciberdelincuentes colocan nombres llamativos como 'Nómina' o 'Evaluaciones' para tentar al personal a conectarlas. Al insertar el pendrive, scripts maliciosos automáticos (BadUSB) infectan la computadora y la red corporativa de Corporación Suiche 7B sin que te des cuenta."
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
          { text: "🟡 Permitirle conectar su celular a tu puerto USB mientras vigilas la pantalla", isCorrect: false },
          { text: "🔴 Prestarle tu computadora corporativa para que transfiera fotos de su trabajo", isCorrect: false }
        ],
        explanation: "¡Muy bien pensado! Los teléfonos inteligentes y cables USB modificados pueden ejecutar transferencia de archivos y scripts de exfiltración de datos (Juice Jacking) en el momento en que se conectan a un puerto USB de una computadora corporativa. NUNCA debes conectar dispositivos móviles de terceros a las PC de Corporación Suiche 7B; siempre debes dirigir a los visitantes a tomacorrientes eléctricos de pared."
      },
      {
        scenarioTitle: "Disco Duro Externo Olvidado en Sala de Juntas",
        speech: "\"Al finalizar una reunión con un equipo multidisciplinario, notas que alguien dejó olvidado un disco duro externo sin ningún nombre ni etiqueta sobre la mesa.\"",
        item: {
          icon: "💽",
          name: "Disco Duro Externo Sin Etiqueta",
          location: "Mesa de Reuniones"
        },
        options: [
          { text: "🟢 Notificar a la Gerencia de Seguridad de la Información / Soporte de TI para su resguardo", isCorrect: true },
          { text: "🟡 Conectarlo a tu laptop corporativa para explorar sus carpetas e identificar a quién pertenece", isCorrect: false },
          { text: "🔴 Llevarte el disco duro a tu casa para probarlo en tu computadora personal", isCorrect: false }
        ],
        explanation: "¡Respuesta correcta! Nunca debemos inspeccionar archivos de dispositivos de almacenamiento desconocidos por nuestra cuenta. El área de TI y la Gerencia de Seguridad de la Información cuentan con entornos seguros y aislados (Sandbox) para analizar la integridad de estos dispositivos antes de devolverlos a su dueño."
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

    document.getElementById('usb-item-icon').textContent = currentCase.item.icon;
    document.getElementById('usb-item-name').textContent = currentCase.item.name;
    document.getElementById('usb-item-location').textContent = `Ubicación: ${currentCase.item.location}`;

    // Render option buttons
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
      app.addPoints(50, true);
      statusEl.className = 'feedback-header feedback-correct';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ¡Excelente Decisión de Seguridad! (+50 PTS)
      `;
    } else {
      app.playAudio('incorrect');
      app.addPoints(0, false);
      statusEl.className = 'feedback-header feedback-incorrect';
      statusEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Riesgo de Infección por Malware (0 PTS)
      `;
    }

    descEl.innerHTML = `
      <p style="margin-bottom:0.8rem; font-weight:600; color:white;">Explicación Práctica de Seguridad:</p>
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
        message: '¡Felicidades! Has completado exitosamente la simulación de protección de dispositivos USB. Aprendiste a evitar trampas de Baiting y proteger los equipos corporativos de Corporación Suiche 7B.',
        type: 'success'
      }).then(() => {
        app.navigateTo('dashboard');
      });
    }
  }
}

// Inicializar contenedores de juego globales
const games = {
  phishing: new PhishingGame(),
  pci: new PciGame(),
  incident: new IncidentGame(),
  password: new PasswordGame(),
  usb: new UsbGame()
};

// Exponer en window para acceso global
window.games = games;
