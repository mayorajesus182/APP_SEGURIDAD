/**
 * ARCADE A — "Jornada Crítica: Un Día en Suiche 7B"
 * Simulación 3D isométrica (Mini3D) de una jornada laboral completa (8:00-17:00) con eventos al azar,
 * decisiones bajo presión, consecuencias en cadena y reporte final del CISO.
 */
(function () {
  'use strict';
  const { U, Mini3D } = window.arcade;

  const SPOTS = {
    pc: { label: 'Tu computadora', icon: '💻', pos: [0, 2.7, 0] },
    phone: { label: 'Teléfono de escritorio', icon: '☎️', pos: [1.25, 2.2, 0.25] },
    recepcion: { label: 'Recepción', icon: '🛎️', pos: [-4, 3.1, 3] },
    usb: { label: 'Pasillo', icon: '🔌', pos: [4.2, 1.3, 3.2] },
    cafe: { label: 'Cafetería', icon: '☕', pos: [-5.5, 3.4, -3.4] },
    printer: { label: 'Impresora', icon: '🖨️', pos: [4.5, 2.6, -3.5] }
  };

  const ROLES = {
    finanzas: '💼 Finanzas',
    rrhh: '🧑‍💼 Capital Humano',
    atencion: '🎧 Atención al Cliente',
    operaciones: '⚙️ Operaciones',
    gerencia: '🏛️ Gerencia'
  };

  // Banco de eventos (lenguaje cotidiano, sin tecnicismos). ok = única respuesta correcta.
  const EVENTS = [
    {
      id: 'e_phish', spot: 'pc', role: ['todos'], dmg: 20, then: 'c_cred',
      title: 'Correo: "Tu cuenta se bloqueará en 2 horas"',
      text: 'Te llega un correo de "soporte-ti@suiche7b-ve.com" que dice: "Verifica tu contraseña en este enlace o perderás el acceso hoy mismo".',
      opts: [
        { t: 'No tocar el enlace y reportar el correo a Seguridad de la Información', ok: true },
        { t: 'Entrar al enlace y escribir mi clave rápido para no perder el acceso', fb: 'Entregaste tu clave a un estafador. El dominio "suiche7b-ve.com" no es el de la empresa.' },
        { t: 'Responder el correo preguntando si es verdad', fb: 'Responder confirma al estafador que tu correo está activo y lo anima a insistir.' }
      ],
      lesson: 'Los mensajes con apuro y amenaza ("hoy mismo") son una señal de fraude. Nunca escribas tu clave desde un enlace de correo.'
    },
    {
      id: 'e_usb', spot: 'usb', role: ['todos'], dmg: 20, then: 'c_virus',
      title: 'Una memoria USB tirada en el pasillo',
      text: 'Encuentras una memoria USB con una etiqueta que dice "Sueldos 2026". No hay nadie cerca.',
      opts: [
        { t: 'Entregarla a Seguridad de la Información sin conectarla a ninguna computadora', ok: true },
        { t: 'Conectarla a mi computadora para ver de quién es', fb: 'Muchas memorias "perdidas" instalan virus apenas se conectan. Es una trampa muy común.' },
        { t: 'Guardarla en mi gaveta para revisarla después', fb: 'Quedarte con ella solo retrasa el problema: alguien podría conectarla por curiosidad.' }
      ],
      lesson: 'Un dispositivo desconocido nunca se conecta. Se entrega a Seguridad para que lo revisen en un entorno aislado.'
    },
    {
      id: 'e_code', spot: 'phone', role: ['todos'], dmg: 20, then: 'c_cod',
      title: 'Llamada de "Soporte Técnico"',
      text: 'Una voz amable dice: "Soy de Soporte Técnico. Te llegó un código por mensaje de texto; léemelo para actualizar tu perfil".',
      opts: [
        { t: 'Colgar sin dar el código y avisar a Seguridad de la Información', ok: true },
        { t: 'Leerle el código; suena muy profesional', fb: 'Ese código es la llave de tu cuenta. Quien lo recibe puede entrar como si fuera tú.' },
        { t: 'Darle solo la mitad de los números', fb: 'Con la mitad ya hacen intentos y presión. Nunca se comparte ni parcialmente.' }
      ],
      lesson: 'Soporte legítimo jamás pide códigos ni claves por teléfono o chat. Cuelga y reporta.'
    },
    {
      id: 'e_visit', spot: 'recepcion', role: ['todos'], dmg: 18,
      title: 'Visitante con chaleco de "mantenimiento"',
      text: 'Una persona sin cita dice que viene "a revisar las computadoras de todos los pisos" y pide pasar rápido porque está atrasada.',
      opts: [
        { t: 'Pedirle que espere y confirmar con Seguridad o con quien lo contrató', ok: true },
        { t: 'Dejarlo pasar; trae chaleco y parece de confianza', fb: 'El uniforme se compra fácil. Muchos intrusos físicos entran así.' },
        { t: 'Acompañarlo yo mismo sin preguntar nada', fb: 'Acompañar no sustituye verificar. Igual tendría acceso a equipos y documentos.' }
      ],
      lesson: 'Toda visita se valida antes de entrar, aunque tenga prisa o uniforme.'
    },
    {
      id: 'e_qr', spot: 'cafe', role: ['todos'], dmg: 15,
      title: 'Cartel con código QR en la cafetería',
      text: 'Hay un cartel pegado en la pared: "Escanea y gana un bono de comida. Solo para empleados". No lo conoces.',
      opts: [
        { t: 'No escanearlo y avisar a Seguridad para que retiren el cartel', ok: true },
        { t: 'Escanearlo con mi celular solo para ver qué es', fb: 'Un QR falso lleva a páginas que roban claves o instalan programas dañinos.' },
        { t: 'Escanearlo y poner mi usuario del trabajo para cobrar el bono', fb: 'Entregaste tu usuario y clave del trabajo a una página falsa.' }
      ],
      lesson: 'Un QR pegado por desconocidos es como un enlace sospechoso: no se escanea.'
    },
    {
      id: 'e_print', spot: 'printer', role: ['todos'], dmg: 12,
      title: 'Documentos con datos de personal en la impresora',
      text: 'Alguien dejó impresas varias hojas con cédulas y sueldos en la bandeja. Nadie las reclama.',
      opts: [
        { t: 'Recogerlas, llevarlas a su dueño o triturarlas, y avisar al área responsable', ok: true },
        { t: 'Dejarlas ahí; ya volverá su dueño', fb: 'Cualquier persona que pase puede leerlas o fotografiarlas.' },
        { t: 'Leerlas y comentarlas con compañeros', fb: 'Divulgar datos de personal es una falta grave de confidencialidad.' }
      ],
      lesson: 'Escritorio limpio: lo impreso con datos personales no se abandona; se resguarda o se tritura.'
    },
    {
      id: 'e_legit', spot: 'pc', role: ['todos'], dmg: 6, legit: true,
      title: 'Correo de Capital Humano: simulacro de evacuación',
      text: 'Llega un correo desde la dirección oficial de Capital Humano invitando a registrar tu asistencia en el portal interno de la empresa (dirección segura, la de siempre).',
      opts: [
        { t: 'Registrar mi asistencia entrando por el portal interno que ya conozco', ok: true },
        { t: 'Marcarlo como fraude y borrarlo; todo correo es sospechoso', fb: 'Desconfiar de todo también es un error: este correo era legítimo y perdiste un trámite.' },
        { t: 'Ignorarlo porque seguro lo atiende otro', fb: 'La participación era obligatoria y quedaste sin registrar.' }
      ],
      lesson: 'No todo es un ataque. Revisa remitente y enlace; si todo coincide con lo oficial, actúa con normalidad.'
    },
    {
      id: 'e_pass', spot: 'pc', role: ['todos'], dmg: 15,
      title: 'Un compañero te pide tu clave',
      text: 'Un compañero te escribe por chat: "Se me olvidó mi clave y tengo un reporte urgente. Pásame la tuya solo por hoy".',
      opts: [
        { t: 'No compartir mi clave y orientarlo para que pida el restablecimiento a Soporte', ok: true },
        { t: 'Dársela solo por hoy; es de confianza', fb: 'Todo lo que se haga con tu clave queda a tu nombre. Las claves son personales.' },
        { t: 'Prestarle mi computadora con mi sesión abierta', fb: 'Es lo mismo que darle tu clave: todo quedará registrado como si lo hubieras hecho tú.' }
      ],
      lesson: 'Tu clave es personal e intransferible, aunque sea un colega de confianza.'
    },
    {
      id: 'e_update', spot: 'pc', role: ['todos'], dmg: 8, legit: true,
      title: 'Aviso oficial de Soporte: reinicio por actualización',
      text: 'Soporte TI (contacto conocido, extensión interna) avisa que hay una actualización programada y pide reiniciar la computadora al terminar el día.',
      opts: [
        { t: 'Guardar mi trabajo y reiniciar al final del día como indican', ok: true },
        { t: 'Desactivar el antivirus para que sea más rápido', fb: 'Apagar la protección te deja vulnerable justo durante la actualización.' },
        { t: 'Ignorarlo durante semanas', fb: 'Las actualizaciones corrigen fallas de seguridad; posponerlas indefinidamente es un riesgo.' }
      ],
      lesson: 'Las actualizaciones oficiales protegen. Verifica que vengan del canal conocido y cúmplelas.'
    },
    {
      id: 'e_ceo', spot: 'pc', role: ['finanzas', 'gerencia', 'operaciones'], dmg: 25, then: 'c_pago',
      title: 'El "Presidente" pide un pago urgente y secreto',
      text: 'Son las 4:40 PM del viernes. Un correo desde un @gmail dice ser del Presidente: "Transfiere hoy este anticipo a esta cuenta nueva y no se lo comentes a nadie".',
      opts: [
        { t: 'No pagar; confirmar por teléfono interno y exigir las firmas de autorización', ok: true },
        { t: 'Hacer la transferencia rápido por miedo a que se moleste', fb: 'Perdiste dinero de la empresa: es el clásico "fraude del falso jefe".' },
        { t: 'Responder al @gmail preguntando a nombre de quién va', fb: 'Hablas con el estafador; solo lo ayudas a convencerte.' }
      ],
      lesson: 'Pagos urgentes y "secretos" siempre se verifican por otro canal y con doble firma.'
    },
    {
      id: 'e_vendor', spot: 'pc', role: ['finanzas', 'operaciones'], dmg: 25, then: 'c_pago',
      title: 'Proveedor cambia su cuenta bancaria',
      text: 'Un proveedor habitual envía un PDF: "Cambiamos de banco; deposite la factura de este mes en esta nueva cuenta a nombre de otra persona".',
      opts: [
        { t: 'Llamar al teléfono que ya teníamos guardado del proveedor antes de cambiar nada', ok: true },
        { t: 'Cambiar la cuenta en el sistema y pagar', fb: 'El pago salió a la cuenta del estafador; difícil de recuperar.' },
        { t: 'Llamar al número de celular que viene dentro de la carta', fb: 'Ese número es del estafador, que te confirmó la mentira.' }
      ],
      lesson: 'Los cambios de cuenta se confirman llamando al contacto original, nunca al dato que viene en el mismo mensaje.'
    },
    {
      id: 'e_cvv', spot: 'phone', role: ['finanzas', 'atencion'], dmg: 15,
      title: 'Cliente quiere dictar los 3 números de atrás de su tarjeta',
      text: 'Un cliente llama por un reclamo y empieza a leerte los 16 dígitos y el código de 3 números del reverso para que los anotes.',
      opts: [
        { t: 'Detenerlo amablemente: no anotar ni pedir el código de atrás ni la clave del cajero', ok: true },
        { t: 'Anotarlos todos en el expediente por si hacen falta', fb: 'Guardar esos datos expone al cliente y a la empresa; está prohibido.' },
        { t: 'Pedirle que envíe una foto de la tarjeta por correo', fb: 'La foto de ambos lados de la tarjeta es justo lo que buscan los delincuentes.' }
      ],
      lesson: 'Jamás se anotan ni se piden el código de atrás (CVV) ni la clave (PIN) de una tarjeta.'
    },
    {
      id: 'e_audit', spot: 'pc', role: ['rrhh', 'finanzas'], dmg: 22,
      title: '"Auditores externos" piden la nómina completa',
      text: 'Un correo de "auditoria.externa@revision-bancaria.org" exige el Excel con cédulas, sueldos y cuentas de todo el personal en 20 minutos.',
      opts: [
        { t: 'Negarme y reportar el correo a Seguridad de la Información y a Cumplimiento', ok: true },
        { t: 'Enviar el archivo para salir del paso', fb: 'Entregaste la identidad y datos bancarios de todo el personal.' },
        { t: 'Enviar solo la mitad de la lista', fb: 'Igual filtraste datos privados a un desconocido.' }
      ],
      lesson: 'Los datos de personal solo se entregan por canales formales y a quien está autorizado, nunca por presión.'
    },
    {
      id: 'e_cv', spot: 'pc', role: ['rrhh'], dmg: 18, then: 'c_virus',
      title: 'Un "candidato" envía su currículo en un archivo extraño',
      text: 'Llega un correo con el archivo "curriculo_final.exe" y el mensaje "Ábralo, es mi hoja de vida".',
      opts: [
        { t: 'No abrirlo; pedir el currículo en PDF por el canal oficial y avisar a Seguridad', ok: true },
        { t: 'Abrirlo; es parte de mi trabajo revisar currículos', fb: 'Los archivos .exe son programas: abrirlo pudo infectar tu equipo.' },
        { t: 'Reenviarlo a mi correo personal para abrirlo en casa', fb: 'Llevaste el riesgo a tu casa y sacaste información de la empresa.' }
      ],
      lesson: 'Un currículo es un PDF o documento; un archivo ejecutable (.exe, .zip dudoso) nunca se abre.'
    },
    {
      id: 'e_family', spot: 'phone', role: ['rrhh'], dmg: 15,
      title: 'Llamada: "Soy el esposo de una empleada"',
      text: 'Un hombre pregunta por la dirección y el sueldo de una compañera "porque es una emergencia familiar".',
      opts: [
        { t: 'No dar datos personales; ofrecer pasar el mensaje y que ella lo llame', ok: true },
        { t: 'Darle la dirección, parece una emergencia real', fb: 'Podría ser alguien peligroso; los datos personales no se dan por teléfono.' },
        { t: 'Darle solo el sueldo pero no la dirección', fb: 'El sueldo también es confidencial.' }
      ],
      lesson: 'Los datos personales de empleados son confidenciales; se ofrece contactarla, no se entregan.'
    },
    {
      id: 'e_chat', spot: 'pc', role: ['atencion'], dmg: 18,
      title: 'Chat: "Dime el saldo de la cuenta de mi mamá"',
      text: 'Un cliente escribe pidiendo saldo y últimos movimientos de una cuenta de otra persona: "Es mi mamá, está enferma y no puede llamar".',
      opts: [
        { t: 'Explicar que solo el titular puede consultar y ofrecer el procedimiento formal', ok: true },
        { t: 'Dar el saldo; parece buena persona', fb: 'Compartiste información financiera de un tercero sin autorización.' },
        { t: 'Dar los movimientos pero no el saldo', fb: 'Cualquier dato de la cuenta es confidencial.' }
      ],
      lesson: 'La identidad del titular se verifica siempre; la compasión no reemplaza al procedimiento.'
    },
    {
      id: 'e_gift', spot: 'recepcion', role: ['operaciones', 'gerencia'], dmg: 18,
      title: 'Mensajero deja un "regalo" para el gerente',
      text: 'Un mensajero entrega una caja con una memoria USB promocional y una nota: "Cortesía de un proveedor; el gerente debe conectarla hoy".',
      opts: [
        { t: 'No entregarla al gerente para conectarla; llevarla a Seguridad para revisión', ok: true },
        { t: 'Dejarla en el escritorio del gerente tal cual', fb: 'Si la conecta por cortesía, puede infectar toda la red.' },
        { t: 'Conectarla yo antes para verificar que funciona', fb: 'Tú habrías activado el programa dañino.' }
      ],
      lesson: 'Los "regalos" con dispositivos se revisan en Seguridad, nunca se conectan por cortesía.'
    },
    {
      id: 'e_wifi', spot: 'cafe', role: ['gerencia', 'operaciones', 'atencion'], dmg: 14,
      title: 'Wi-Fi gratis en un viaje de trabajo',
      text: 'Estás en una cafetería por trabajo y ves "WiFi_Gratis_Sin_Clave". Necesitas enviar un archivo de la empresa.',
      opts: [
        { t: 'Usar los datos de mi celular con la VPN de la empresa y no el Wi-Fi abierto', ok: true },
        { t: 'Conectarme al Wi-Fi gratis; es más rápido', fb: 'En redes abiertas pueden espiar lo que envías.' },
        { t: 'Pedirle la computadora prestada a otra persona del café', fb: 'Dejaste tus datos en un equipo ajeno.' }
      ],
      lesson: 'Fuera de la oficina, usa datos móviles y VPN; evita redes abiertas.'
    }
  ];

  // Consecuencias en cadena (aparecen más tarde si fallaste el evento original)
  const CONSEQUENCES = {
    c_cred: {
      id: 'c_cred', spot: 'pc', dmg: 25, urgent: true,
      title: '⚠️ Consecuencia: alguien entró a tu cuenta',
      text: 'Por el correo falso de hoy, el sistema avisa que tu cuenta se abrió desde otro país. Un colega nota correos extraños enviados a tu nombre.',
      opts: [
        { t: 'Avisar de inmediato a Seguridad y cambiar mi clave', ok: true },
        { t: 'Esperar a ver si se arregla solo', fb: 'Cada minuto que pasa el atacante avanza más.' },
        { t: 'Borrar los correos raros para que nadie se entere', fb: 'Borrar pruebas dificulta la investigación y empeora el daño.' }
      ],
      lesson: 'Reportar rápido reduce el daño: es lo más valioso que puedes hacer tras un error.'
    },
    c_virus: {
      id: 'c_virus', spot: 'pc', dmg: 25, urgent: true,
      title: '⚠️ Consecuencia: tu computadora muestra un mensaje de rescate',
      text: 'Tu computadora está muy lenta y aparece un mensaje: "Tus archivos fueron secuestrados. Paga para recuperarlos".',
      opts: [
        { t: 'Desconectar el cable de red o Wi-Fi y llamar de inmediato a Seguridad', ok: true },
        { t: 'Pagar para recuperar los archivos', fb: 'Pagar financia al delincuente y no garantiza nada.' },
        { t: 'Apagarla y no decirle a nadie', fb: 'El virus pudo extenderse a la red; callar lo agrava.' }
      ],
      lesson: 'Ante un virus: aislar el equipo de la red y avisar al instante.'
    },
    c_cod: {
      id: 'c_cod', spot: 'phone', dmg: 22, urgent: true,
      title: '⚠️ Consecuencia: mensajes raros salen desde tu cuenta',
      text: 'Compañeros avisan que desde tu cuenta de mensajería se piden transferencias de dinero. Alguien tomó el control con el código que entregaste.',
      opts: [
        { t: 'Avisar a mis contactos y a Seguridad, y recuperar el control de mi cuenta', ok: true },
        { t: 'No decir nada; tal vez se corte solo', fb: 'Seguirán pidiendo dinero con tu identidad.' },
        { t: 'Reenviar el mensaje a mi grupo para preguntar', fb: 'Propagaste el problema.' }
      ],
      lesson: 'Cuando tu cuenta es tomada, avisar rápido a todos protege a tus compañeros.'
    },
    c_pago: {
      id: 'c_pago', spot: 'phone', dmg: 30, urgent: true,
      title: '⚠️ Consecuencia: el banco llama por una transferencia sospechosa',
      text: 'El banco informa de una transferencia grande saliente de la empresa hacia una cuenta desconocida, hecha a raíz del pedido falso.',
      opts: [
        { t: 'Pedir detener la operación y reportar de inmediato a Tesorería y Seguridad con todos los detalles', ok: true },
        { t: 'Decir que fue una operación normal', fb: 'Autorizaste un pago fraudulento por segunda vez.' },
        { t: 'No contestar la llamada para evitar problemas', fb: 'Se perdió la única ventana de tiempo para frenar el dinero.' }
      ],
      lesson: 'En fraudes de pago, las primeras horas son clave: el banco puede frenar o recuperar fondos.'
    }
  };

  class JornadaGame {
    constructor() {
      this.running = false;
      this.raf = null;
      this.engine = null;
    }

    stop() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
      this._clean && this._clean();
      this._clean = null;
    }

    open() {
      this.stop();
      const root = window.arcade.root(this.key);
      if (!root) return;
      const dept = (window.app && window.app.state && window.app.state.user.department || '').toLowerCase();
      const guess = dept.includes('finanz') ? 'finanzas' : dept.includes('humano') ? 'rrhh'
        : (dept.includes('cliente') || dept.includes('servicio')) ? 'atencion'
          : (dept.includes('presidencia') || dept.includes('gerencia')) ? 'gerencia' : 'operaciones';
      const best = window.arcade.getBest(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('🏢 Jornada Crítica: Un Día en Suiche 7B', best ? `Mejor puntaje: <strong>${best}</strong>` : '')}
        <div class="arc-intro">
          <div class="arc-intro-text">
            <h2>Sobrevive a una jornada completa de oficina</h2>
            <p>Son las <strong>8:00 AM</strong>. Durante el día aparecerán situaciones en distintos puntos de la oficina 3D
              (<strong>❗ marcadores rojos</strong>). Haz clic en cada una, decide qué hacer y protege el <strong>Escudo de la Empresa</strong>.
              Algunas decisiones tienen <strong>consecuencias más tarde</strong>… y no todo es un ataque.</p>
            <ul>
              <li>⏱️ El reloj corre solo mientras no estás decidiendo. Si dejas pasar una situación, cuenta como error.</li>
              <li>🛡️ Si el escudo llega a 0, la jornada termina en una brecha.</li>
              <li>📋 Al final recibes el <strong>Informe del CISO</strong> con tu línea de tiempo.</li>
            </ul>
            <h4>¿En qué área trabajas hoy?</h4>
            <div class="arc-role-grid" id="jor-roles">
              ${Object.keys(ROLES).map((k) => `<button class="btn ${k === guess ? 'btn-primary' : 'btn-secondary'}" data-role="${k}">${ROLES[k]}</button>`).join('')}
            </div>
          </div>
          <div class="arc-intro-visual"><canvas id="jor-preview" width="520" height="340"></canvas></div>
        </div>`;
      const roleBtns = root.querySelectorAll('#jor-roles button');
      roleBtns.forEach((b) => b.addEventListener('click', () => this.start(b.getAttribute('data-role'))));
      this._previewLoop();
    }

    _previewLoop() {
      const c = U.$('jor-preview');
      if (!c) return;
      const eng = new Mini3D(c, { scale: 34, cy: 0.6 });
      let t = 0;
      const loop = () => {
        const cv = U.$('jor-preview');
        if (!cv) return;
        t += 0.016;
        eng.yaw = Math.PI / 4 + Math.sin(t * 0.6) * 0.18;
        eng.clear();
        this._buildScene(eng, { t, pending: {}, shield: 100 });
        eng.ctx.clearRect(0, 0, cv.width, cv.height);
        this._bg(eng.ctx, cv, 120);
        eng.render();
        this.raf = requestAnimationFrame(loop);
      };
      this.running = true;
      loop();
    }

    _bg(ctx, cv, clock) {
      const f = U.clamp(clock / 540, 0, 1);
      const warm = Math.sin(f * Math.PI);
      const g = ctx.createLinearGradient(0, 0, 0, cv.height);
      g.addColorStop(0, `rgb(${Math.round(18 + 22 * (1 - warm))},${Math.round(30 + 18 * warm)},${Math.round(58 + 20 * warm)})`);
      g.addColorStop(1, '#0a1020');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
    }

    // ---------------- Escena 3D de la oficina ----------------
    _figure(e, x, z, shirt, skin, id) {
      e.addBox(x, 0, z, 0.55, 0.9, 0.35, '#2b3550', id);
      e.addBox(x, 0.9, z, 0.7, 0.85, 0.42, shirt, id);
      e.addBox(x, 1.75, z, 0.45, 0.45, 0.45, skin, id);
    }

    _buildScene(e, s) {
      const L = { layer: -2 };
      for (let i = -3; i < 3; i++) {
        for (let j = -3; j < 2; j++) {
          e.addBox(i * 2 + 1, -0.1, j * 2 + 1, 2, 0.1, 2, (i + j) % 2 === 0 ? '#3b4a68' : '#33415c', null, L);
        }
      }
      const W = { layer: -1 };
      e.addBox(-6.15, 0, -1, 0.3, 4.2, 10.4, '#566684', null, W);
      e.addBox(0, 0, -5.15, 12.6, 4.2, 0.3, '#4b5a78', null, W);
      // Ventanas
      e.addBox(-5.95, 1.8, 0.5, 0.1, 1.5, 2.2, '#7dd3fc', null, { layer: -0.5, emissive: 0.15 });
      e.addBox(-1.5, 1.8, -4.95, 2.4, 1.5, 0.1, '#7dd3fc', null, { layer: -0.5, emissive: 0.15 });
      // Puerta
      e.addBox(3.6, 0, -4.9, 1.6, 3.1, 0.2, '#8a5a3a', null, { layer: -0.5 });
      e.addBox(4.2, 1.4, -4.78, 0.12, 0.12, 0.12, '#fde047', null, { layer: -0.4 });

      // Escritorio principal
      const D = (x, z, w, d) => e.addBox(x, 0, z, w, 1, d, '#6b4f3a');
      D(-1.4, -0.65, 0.12, 0.12); D(1.4, -0.65, 0.12, 0.12); D(-1.4, 0.65, 0.12, 0.12); D(1.4, 0.65, 0.12, 0.12);
      e.addBox(0, 1, 0, 3.2, 0.14, 1.7, '#8a6a4d');
      // Monitor (PC)
      const pcHot = s.pending.pc;
      e.addBox(-0.3, 1.14, -0.1, 0.35, 0.25, 0.35, '#1f2937', 'pc');
      e.addBox(-0.3, 1.39, -0.1, 1.35, 0.85, 0.1, pcHot ? '#60a5fa' : '#1e293b', 'pc', { emissive: pcHot ? 0.3 + 0.2 * Math.sin(s.t * 6) : 0 });
      e.addBox(-0.3, 1.14, 0.45, 0.9, 0.06, 0.32, '#475569', 'pc');
      // Teléfono
      e.addBox(1.2, 1.14, 0.3, 0.55, 0.22, 0.5, '#111827', 'phone', { emissive: s.pending.phone ? 0.3 + 0.3 * Math.sin(s.t * 12) : 0 });
      // Silla y empleado
      e.addBox(0, 0.5, -1.35, 0.9, 0.12, 0.9, '#334155');
      e.addBox(0, 0, -1.35, 0.14, 0.5, 0.14, '#1f2937');
      this._figure(e, 0, -1.35, '#2563eb', '#e8b98d');

      // Recepción
      e.addBox(-4, 0, 3, 2.6, 1.1, 1, '#7c5a43', 'recepcion');
      e.addBox(-4, 1.1, 3, 2.7, 0.1, 1.1, '#a7794f', 'recepcion');
      e.addBox(-3.4, 1.2, 3, 0.35, 0.3, 0.3, '#fde047', 'recepcion', { emissive: s.pending.recepcion ? 0.3 : 0 });
      if (s.pending.recepcion) this._figure(e, -4, 1.7, '#f59e0b', '#c68a5c', 'recepcion');

      // USB en el suelo
      e.addBox(4.2, 0, 3.2, 0.5, 0.1, 0.25, s.pending.usb ? '#ef4444' : '#94a3b8', 'usb', { emissive: s.pending.usb ? 0.4 : 0 });
      e.addBox(4.5, 0.1, 3.2, 0.14, 0.07, 0.14, '#e5e7eb', 'usb');

      // Cafetería + cartel QR
      e.addBox(-4.8, 0, -3.4, 1.4, 1, 1.4, '#6b7280');
      e.addBox(-4.8, 1, -3.4, 1.5, 0.1, 1.5, '#9ca3af');
      e.addBox(-4.7, 1.1, -3.3, 0.4, 0.4, 0.4, '#fafafa');
      e.addBox(-5.95, 1.6, -3.4, 0.1, 1.4, 1.2, '#f8fafc', 'cafe', { emissive: s.pending.cafe ? 0.25 : 0 });
      e.addBox(-5.88, 1.9, -3.4, 0.05, 0.7, 0.7, '#0f172a', 'cafe');

      // Impresora y papeles
      e.addBox(4.5, 0, -3.5, 1.3, 1, 1.1, '#9ca3af', 'printer');
      e.addBox(4.5, 1, -3.5, 1.1, 0.25, 0.9, '#d1d5db', 'printer');
      e.addBox(4.5, 1.25, -3.5, 0.7, 0.08, 0.5, s.pending.printer ? '#fef08a' : '#ffffff', 'printer', { emissive: s.pending.printer ? 0.3 : 0 });

      // Planta decorativa
      e.addBox(-1.8, 0, 4, 0.5, 0.5, 0.5, '#7c4a2d');
      e.addBox(-1.8, 0.5, 4, 0.8, 0.9, 0.8, '#16a34a');
    }

    // ---------------- Lógica de la partida ----------------
    start(role) {
      const root = window.arcade.root(this.key);
      this.stop();
      this.role = role;
      // Selección de eventos: los del rol + completar con los generales
      const roleSpecific = U.shuffle(EVENTS.filter((e) => e.role.includes(role) && !e.role.includes('todos')));
      const general = U.shuffle(EVENTS.filter((e) => e.role.includes('todos')));
      const base = roleSpecific.slice(0, 4);
      const chosen = U.shuffle([...base, ...general.slice(0, 10 - base.length)]);
      this.queue = chosen.map((ev, i) => ({ ev, at: 18 + i * 46 + U.rnd(-6, 6) })).sort((a, b) => a.at - b.at);
      this.pending = [];
      this.log = [];
      this.clock = 0;
      this.shield = 100;
      this.correct = 0;
      this.wrong = 0;
      this.missed = 0;
      this.flash = 0;
      this.state = 'running';
      this.current = null;
      this.t = 0;
      this.lastTick = 0;

      root.innerHTML = `
        ${window.arcade.headerHTML(`🏢 Jornada Crítica — ${ROLES[role]}`, '<span id="jor-clock" class="arc-clock">08:00</span>')}
        <div class="arc-jornada">
          <div class="arc-stage">
            <canvas id="jor-canvas" width="900" height="560"></canvas>
            <div class="arc-stage-hint">🖱️ Haz clic en los marcadores <strong>❗</strong> de la oficina 3D · Arrastra sobre la escena para girar un poco la cámara</div>
          </div>
          <div class="arc-side">
            <div class="arc-hud">
              <div class="arc-hud-row"><span>🛡️ Escudo de la Empresa</span><strong id="jor-shield-txt">100%</strong></div>
              <div class="arc-bar"><div id="jor-shield" class="arc-bar-fill" style="width:100%"></div></div>
              <div class="arc-hud-mini">
                <span>✅ <b id="jor-ok">0</b></span><span>❌ <b id="jor-bad">0</b></span><span>⏱️ <b id="jor-miss">0</b></span>
              </div>
              <div class="arc-bar thin"><div id="jor-day" class="arc-bar-fill day" style="width:0%"></div></div>
            </div>
            <div id="jor-pending" class="arc-pending"></div>
            <div id="jor-event" class="arc-event"><div class="arc-event-empty">Todo tranquilo… por ahora. Cuando algo ocurra, aparecerá un <strong>❗</strong> en la oficina.</div></div>
          </div>
        </div>`;

      const canvas = U.$('jor-canvas');
      this.engine = new Mini3D(canvas, { scale: 46, cy: 0.62 });
      this._drag = 0;
      this._dragStart = null;
      const onDown = (ev) => {
        const p = Mini3D.canvasPoint(canvas, ev);
        this._dragStart = { x: p.x, yaw: this._drag, moved: false, p };
      };
      const onMove = (ev) => {
        if (!this._dragStart) return;
        const p = Mini3D.canvasPoint(canvas, ev);
        if (Math.abs(p.x - this._dragStart.x) > 4) this._dragStart.moved = true;
        this._drag = U.clamp(this._dragStart.yaw + (p.x - this._dragStart.x) * 0.004, -0.35, 0.35);
      };
      const onUp = (ev) => {
        const st = this._dragStart;
        this._dragStart = null;
        if (st && !st.moved) {
          const id = this.engine.pick(st.p.x, st.p.y);
          if (id) this.clickSpot(id);
        }
      };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointerleave', () => { this._dragStart = null; });

      this.running = true;
      this.lastTs = performance.now();
      const loop = (ts) => {
        if (!this.running || !U.$('jor-canvas')) return;
        const dt = Math.min(0.1, (ts - this.lastTs) / 1000);
        this.lastTs = ts;
        this.tick(dt);
        this.draw();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    pendingSpots() {
      const m = {};
      this.pending.forEach((p) => { m[p.ev.spot] = p; });
      return m;
    }

    tick(dt) {
      this.t += dt;
      this.flash = Math.max(0, this.flash - dt * 1.5);
      if (this.state !== 'running') return;
      this.clock += dt * 2; // 1 s real = 2 min de la jornada (9 h ≈ 4 min 30 s)
      // Aparición de eventos
      while (this.queue.length && this.queue[0].at <= this.clock) {
        const spotsBusy = this.pendingSpots();
        const next = this.queue[0];
        if (this.pending.length >= 3 || spotsBusy[next.ev.spot]) {
          next.at = this.clock + 6; // se difiere un poco si la oficina está saturada
          this.queue.sort((a, b) => a.at - b.at);
          break;
        }
        this.queue.shift();
        this.spawn(next.ev);
      }
      // Vencimientos
      for (const p of [...this.pending]) {
        if (this.clock >= p.deadline && this.current !== p) this.expire(p);
      }
      if (this.clock >= 540) this.finish(false);
    }

    spawn(ev) {
      const life = ev.urgent ? 55 : 75;
      this.pending.push({ ev, born: this.clock, deadline: this.clock + life, life });
      U.snd('incident_alert');
      this.updatePending(true);
    }

    expire(p) {
      this.pending = this.pending.filter((x) => x !== p);
      this.missed++;
      const dmg = Math.round(p.ev.dmg * 0.8);
      this.hit(dmg);
      this.log.push({ time: U.fmtClock(this.clock), title: p.ev.title, res: 'expired', lesson: p.ev.lesson, dmg });
      U.snd('incorrect');
      this.toast(`⏱️ Dejaste pasar: "${p.ev.title}" (−${dmg}%)`);
      this.updateHud();
      this.updatePending(true);
      if (this.shield <= 0) this.finish(true);
    }

    hit(d) {
      this.shield = Math.max(0, this.shield - d);
      this.flash = 1;
    }

    toast(msg) {
      const box = U.$('jor-event');
      if (box && this.state === 'running' && !this.current) {
        box.innerHTML = `<div class="arc-event-empty warn">${U.esc(msg)}</div>`;
      }
    }

    clickSpot(id) {
      if (this.state !== 'running') return;
      const p = this.pending.find((x) => x.ev.spot === id);
      if (p) this.openEvent(p);
    }

    openEvent(p) {
      this.state = 'deciding';
      this.current = p;
      U.snd('click');
      const ev = p.ev;
      const opts = window.shuffleOptions ? window.shuffleOptions(ev.opts.map((o) => ({ ...o, isCorrect: !!o.ok }))) : U.shuffle(ev.opts);
      this.curOpts = opts;
      const box = U.$('jor-event');
      box.innerHTML = `
        <div class="jor-ev-tag">${SPOTS[ev.spot].icon} ${SPOTS[ev.spot].label} · ${U.fmtClock(this.clock)}${ev.urgent ? ' · <b class="urg">URGENTE</b>' : ''}</div>
        <h3>${U.esc(ev.title)}</h3>
        <p>${U.esc(ev.text)}</p>
        <div class="jor-opts">
          ${opts.map((o, i) => `<button class="jor-opt" data-i="${i}"><span class="jor-opt-l">${U.LETTERS[i]}</span><span>${U.esc(o.t)}</span></button>`).join('')}
        </div>
        <div class="arc-paused">⏸️ El reloj está en pausa mientras decides</div>`;
      box.querySelectorAll('.jor-opt').forEach((b) => b.addEventListener('click', () => this.choose(parseInt(b.getAttribute('data-i'), 10))));
    }

    choose(i) {
      if (this.state !== 'deciding' || !this.current) return;
      const p = this.current;
      const ev = p.ev;
      const o = this.curOpts[i];
      const ok = !!(o && (o.ok || o.isCorrect));
      this.pending = this.pending.filter((x) => x !== p);
      let fb;
      if (ok) {
        this.correct++;
        this.shield = Math.min(100, this.shield + 2);
        U.snd('correct');
        fb = `<div class="jor-fb ok"><b>✅ ¡Buena decisión!</b><p>${U.esc(ev.lesson)}</p></div>`;
        this.log.push({ time: U.fmtClock(this.clock), title: ev.title, res: 'ok', lesson: ev.lesson, dmg: 0 });
      } else {
        this.wrong++;
        this.hit(ev.dmg);
        U.snd('incorrect');
        const bad = ev.opts.find((x) => x.t === o.t);
        fb = `<div class="jor-fb bad"><b>❌ Decisión riesgosa (−${ev.dmg}% de escudo)</b><p>${U.esc((bad && bad.fb) || 'Esa opción pone en riesgo a la empresa.')}</p><p><b>Lo correcto:</b> ${U.esc(ev.opts.find((x) => x.ok).t)}</p><p>${U.esc(ev.lesson)}</p></div>`;
        this.log.push({ time: U.fmtClock(this.clock), title: ev.title, res: 'bad', lesson: ev.lesson, dmg: ev.dmg });
        if (ev.then && CONSEQUENCES[ev.then] && this.clock < 455) {
          this.queue.push({ ev: CONSEQUENCES[ev.then], at: this.clock + U.rnd(40, 70) });
          this.queue.sort((a, b) => a.at - b.at);
        }
      }
      const box = U.$('jor-event');
      box.innerHTML = fb + '<button class="btn btn-primary" id="jor-continue" style="width:100%; margin-top:0.8rem;">Continuar la jornada →</button>';
      U.$('jor-continue').addEventListener('click', () => this.resume());
      this.updateHud();
      this.updatePending(true);
    }

    resume() {
      U.snd('click');
      this.current = null;
      if (this.shield <= 0) { this.finish(true); return; }
      this.state = 'running';
      const box = U.$('jor-event');
      if (box) box.innerHTML = '<div class="arc-event-empty">Sigue el día… vigila los marcadores <strong>❗</strong>.</div>';
      this.updatePending(true);
    }

    updateHud() {
      const s = Math.round(this.shield);
      const bar = U.$('jor-shield');
      if (bar) {
        bar.style.width = `${s}%`;
        bar.style.background = s > 60 ? '#22c55e' : s > 30 ? '#f59e0b' : '#ef4444';
      }
      const set = (id, v) => { const el = U.$(id); if (el) el.textContent = v; };
      set('jor-shield-txt', `${s}%`);
      set('jor-ok', this.correct);
      set('jor-bad', this.wrong);
      set('jor-miss', this.missed);
    }

    updatePending(force) {
      const now = performance.now();
      if (!force && now - (this._lastPend || 0) < 400) return;
      this._lastPend = now;
      const el = U.$('jor-pending');
      if (!el) return;
      if (!this.pending.length) { el.innerHTML = '<span class="arc-pend-none">Sin situaciones pendientes</span>'; return; }
      el.innerHTML = this.pending.map((p, i) => {
        const left = Math.max(0, Math.round((p.deadline - this.clock) / 2));
        return `<button class="arc-pend ${left < 12 ? 'urgent' : ''}" data-i="${i}">${SPOTS[p.ev.spot].icon} ${SPOTS[p.ev.spot].label} <span>⏱ ${left}s</span></button>`;
      }).join('');
      el.querySelectorAll('.arc-pend').forEach((b) => b.addEventListener('click', () => {
        const p = this.pending[parseInt(b.getAttribute('data-i'), 10)];
        if (p && this.state === 'running') this.openEvent(p);
      }));
    }

    draw() {
      const e = this.engine;
      const cv = e.canvas;
      e.yaw = Math.PI / 4 + this._drag + Math.sin(this.t * 0.4) * 0.04;
      e.clear();
      const pendMap = this.pendingSpots();
      this._buildScene(e, { t: this.t, pending: pendMap, shield: this.shield });
      this.pending.forEach((p) => {
        const sp = SPOTS[p.ev.spot];
        const ratio = (p.deadline - this.clock) / p.life;
        e.addSprite(sp.pos[0], sp.pos[1] + 0.15 * Math.sin(this.t * 4), sp.pos[2], {
          id: p.ev.spot, text: p.ev.urgent ? '‼' : '!', r: 16, pulse: this.t * 7, ring: ratio,
          ringColor: ratio < 0.3 ? '#ef4444' : '#fbba0a', label: sp.label,
          bg: p.ev.urgent ? 'rgba(220,38,38,0.95)' : 'rgba(234,88,12,0.95)'
        });
      });
      const ctx = e.ctx;
      ctx.clearRect(0, 0, cv.width, cv.height);
      this._bg(ctx, cv, this.clock);
      e.render();
      // Domo del escudo alrededor del escritorio
      const c = e.project([0, 0.6, 0]);
      const col = this.shield > 60 ? '34,197,94' : this.shield > 30 ? '245,158,11' : '239,68,68';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 8, 190, 120, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${col},${0.25 + 0.25 * Math.sin(this.t * 3)})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(239,68,68,${this.flash * 0.35})`;
        ctx.fillRect(0, 0, cv.width, cv.height);
      }
      // Reloj y barra del día
      const clk = U.$('jor-clock');
      if (clk) clk.textContent = U.fmtClock(Math.min(540, this.clock));
      const day = U.$('jor-day');
      if (day) day.style.width = `${Math.min(100, (this.clock / 540) * 100)}%`;
      this.updateHud();
      this.updatePending(false);
    }

    async finish(breach) {
      if (this.state === 'ended') return;
      this.state = 'ended';
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      const shield = Math.round(this.shield);
      const raw = breach ? this.correct * 12 : shield * 1.2 + this.correct * 14;
      const awarded = await window.arcade.award(this.key, raw);
      U.snd(breach ? 'incorrect' : 'complete');
      const grade = breach ? 'Brecha de seguridad' : shield >= 85 ? 'Centinela Ejemplar' : shield >= 60 ? 'Guardián Atento' : shield >= 35 ? 'Aprendiz en Riesgo' : 'Día Crítico';
      const lessons = [];
      this.log.filter((l) => l.res !== 'ok').forEach((l) => { if (!lessons.includes(l.lesson)) lessons.push(U.esc(l.lesson)); });
      const timeline = this.log.map((l) => `
        <div class="arc-tl ${l.res}"><span class="tl-time">${l.time}</span><span class="tl-ico">${l.res === 'ok' ? '✅' : l.res === 'bad' ? '❌' : '⏱️'}</span>
        <span class="tl-txt">${U.esc(l.title)}${l.dmg ? ` <em>(−${l.dmg}%)</em>` : ''}</span></div>`).join('');
      const root = window.arcade.root(this.key);
      root.innerHTML = window.arcade.headerHTML('📋 Informe del CISO — Jornada Crítica') +
        window.arcade.resultHTML({
          emoji: breach ? '🚨' : shield >= 60 ? '🏆' : '🛡️',
          title: grade,
          subtitle: breach ? 'El escudo de la empresa se agotó y ocurrió una brecha.' : `Terminaste la jornada con el ${shield}% del escudo.`,
          stats: [['Escudo final', `${shield}%`], ['Aciertos', this.correct], ['Errores', this.wrong], ['Ignoradas', this.missed]],
          lessons: lessons.slice(0, 5),
          extra: `<div class="arc-timeline"><h4>🕒 Línea de tiempo de tu jornada</h4>${timeline || '<em>Sin eventos</em>'}</div>`,
          awarded, win: !breach, retryJs: "arcade.games.arcade_jornada.open()"
        });
    }
  }

  window.arcade.register('arcade_jornada', new JornadaGame());
})();
