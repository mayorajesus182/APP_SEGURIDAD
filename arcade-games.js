/**
 * ARCADE B, C y D
 *  B) Bandeja Blindada  — arcade de clasificación de correos con tarjetas 3D arrastrables.
 *  C) Caza-Fraudes      — duelo de cartas contra "El Estafador" (cartas con efecto 3D).
 *  D) La Bóveda Digital — escape room con bóveda 3D (Mini3D) y 5 candados con acertijos.
 */
(function () {
  'use strict';
  const { U, Mini3D } = window.arcade;

  // ===========================================================================
  // B) BANDEJA BLINDADA
  // ===========================================================================
  const MAILS = [
    // --- Fraudes ---
    { type: 'phish', from: 'soporte-ti@suiche7b-ve.com', subj: 'URGENTE: tu cuenta se bloqueará hoy', prev: 'Verifica tu contraseña en este enlace o perderás el acceso en 2 horas.', clue: 'El dominio "suiche7b-ve.com" no es el oficial y te mete prisa para que no pienses.' },
    { type: 'phish', from: 'facturacion@cantv-ve.net', subj: 'Factura pendiente — ver adjunto', prev: 'Adjuntamos el detalle de su deuda: factura_mayo.zip', clue: 'Una factura dentro de un ZIP es señal de virus; el dominio no es del proveedor real.' },
    { type: 'phish', from: 'presidente.suiche7b@gmail.com', subj: 'Transferencia urgente y confidencial', prev: 'Haz el pago hoy a esta cuenta y no se lo comentes a nadie.', clue: 'Los directivos no ordenan pagos desde Gmail ni piden mantenerlo en secreto.' },
    { type: 'phish', from: 'premios@sorteo-empleados.xyz', subj: '¡Ganaste un bono de comida!', prev: 'Reclámalo hoy escaneando el código QR e ingresando tu usuario del trabajo.', clue: 'Los premios inesperados que piden tu clave son un engaño.' },
    { type: 'phish', from: 'auditoria.externa@revision-bancaria.org', subj: 'Envíe la nómina completa en 20 minutos', prev: 'Necesitamos cédulas, sueldos y cuentas de todo el personal de inmediato.', clue: 'Nadie legítimo pide datos de todo el personal por correo y con apuro.' },
    { type: 'phish', from: 'auditoria.externa@revision-corporativa.org', subj: 'Envíe la nómina completa en 20 minutos', prev: 'Necesitamos cédulas, sueldos y cuentas de todo el personal de inmediato.', clue: 'Nadie legítimo pide datos de todo el personal por correo y con apuro.' },
    { type: 'phish', from: 'cobranzas@proveedor-oficina.com.ve', subj: 'Nueva cuenta bancaria para sus pagos', prev: 'Desde hoy deposite en la cuenta adjunta, a nombre de otra persona.', clue: 'Los cambios de cuenta se confirman llamando al teléfono guardado, nunca por el mismo correo.' },
    { type: 'phish', from: 'no-reply@seguridad-microsoft.info', subj: 'Inicio de sesión sospechoso: confirme su clave', prev: 'Alguien entró a su cuenta. Escriba su contraseña para protegerla.', clue: 'Ninguna empresa pide tu clave por correo; el dominio .info es raro.' },
    { type: 'phish', from: 'rrhh@suiche7b-ve.com', subj: 'Nuevo reglamento: descargue y firme', prev: 'Ejecute el archivo reglamento_2026.exe para firmar digitalmente.', clue: 'Un archivo .exe es un programa; un reglamento llegaría como PDF. Dominio falso.' },
    { type: 'phish', from: 'envios@courier-express.top', subj: 'Su paquete está retenido en aduana', prev: 'Pague $2 en este enlace para liberarlo hoy.', clue: 'Cobros pequeños para "liberar paquetes" buscan tu tarjeta.' },
    { type: 'phish', from: 'asistente.presidencia@outlook.com', subj: '¿Estás en tu escritorio? Necesito un favor', prev: 'Compra 5 tarjetas de regalo y envíame los códigos. Es una sorpresa.', clue: 'Pedir tarjetas de regalo y códigos es una estafa clásica de falso jefe.' },
    { type: 'phish', from: 'soporte@suiche7b.com.ve.verifica-cuenta.com', subj: 'Actualización de su buzón', prev: 'Inicie sesión para evitar la suspensión del buzón corporativo.', clue: 'El dominio real termina en ".verifica-cuenta.com", no en "suiche7b.com.ve".' },
    { type: 'phish', from: 'banco-seguro@notificacion-pagos.com', subj: 'Cuenta suspendida: ingrese su clave del cajero', prev: 'Para reactivar su cuenta escriba su clave de 4 dígitos.', clue: 'Ningún banco pide la clave del cajero por correo.' },
    { type: 'phish', from: 'notificaciones@red-interbancaria-ve.com', subj: 'Acceso suspendido: ingrese su clave corporativa', prev: 'Para reactivar su acceso a los sistemas de la red escriba su contraseña.', clue: 'Dominio falso: Corporación Suiche 7B nunca pide contraseñas por correo.' },
    { type: 'phish', from: 'teletrabajo@suiche7b-vpn.net', subj: 'Instale esta nueva VPN hoy', prev: 'Descargue el programa desde este enlace para seguir trabajando desde casa.', clue: 'Los programas de la empresa los instala Tecnología, no se descargan de un correo.' },
    { type: 'phish', from: 'tesoreria@suiche7b.com.ve', subj: 'Aprobación urgente: ingrese sus datos', prev: 'Ingrese a http://pagos-urgentes.link/entrar para aprobar el pago de las 3 PM.', clue: 'Aunque el remitente parece oficial, el enlace es externo y sin candado (http).' },
    { type: 'phish', from: 'cliente.reclamos@gmail.com', subj: 'Fotos de mi reclamo', prev: 'Abra el adjunto fotos_reclamo.scr para ver mi tarjeta.', clue: 'La extensión .scr es un programa; las fotos son .jpg o .png.' },
    { type: 'phish', from: 'finanzas@suiche7b.com.ve', subj: 'Aprobación urgente: ingrese sus datos', prev: 'Ingrese a http://pagos-urgentes.link/entrar para aprobar el pago de las 3 PM.', clue: 'Aunque el remitente parece oficial, el enlace es externo y sin candado (http).' },
    { type: 'phish', from: 'soporte.aliado@gmail.com', subj: 'Capturas del caso Pago Móvil Interbancario', prev: 'Abra el adjunto captura_pagomovil.scr para ver el error.', clue: 'La extensión .scr es un programa; las imágenes reales son .jpg o .png.' },
    { type: 'phish', from: 'avisos@linkdin-mail.com', subj: 'Tienes 5 mensajes sin leer', prev: 'Inicia sesión aquí para verlos ahora.', clue: '"linkdin" está mal escrito: es un sitio imitador.' },
    // --- Seguros ---
    { type: 'safe', from: 'talento@suiche7b.com.ve', subj: 'Simulacro anual de evacuación', prev: 'Registra tu asistencia en https://portal.suiche7b.com.ve/simulacro', clue: 'Dominio oficial y enlace seguro (https) a la intranet.' },
    { type: 'safe', from: 'capital.humano@suiche7b.com.ve', subj: 'Simulacro anual de evacuación', prev: 'Registra tu asistencia en https://portal.suiche7b.com.ve/simulacro', clue: 'Dominio oficial y enlace seguro (https) a la intranet.' },
    { type: 'safe', from: 'finanzas@suiche7b.com.ve', subj: 'Cierre mensual: reporte en PDF', prev: 'Adjunto el reporte del mes para la reunión del lunes.', clue: 'Remitente interno, adjunto normal y sin pedir claves ni pagos.' },
    { type: 'safe', from: 'seguridad@suiche7b.com.ve', subj: 'Recordatorio: cursos de la Academia CiberSegura', prev: 'Quedan módulos pendientes en la Academia. Ingresa desde tu panel de siempre.', clue: 'Comunicado interno sin enlaces raros ni urgencias.' },
    { type: 'safe', from: 'gerencia.operaciones@suiche7b.com.ve', subj: 'Agenda de la reunión del lunes 10:00', prev: 'Temas: indicadores del mes y plan de capacitación.', clue: 'Correo interno rutinario.' },
    { type: 'safe', from: 'soporte@suiche7b.com.ve', subj: 'Mantenimiento programado: viernes 6 PM', prev: 'Se reiniciarán los equipos. No se requiere ninguna acción ni clave.', clue: 'Informa sin pedir datos y viene del canal oficial.' },
    { type: 'safe', from: 'comunicaciones@suiche7b.com.ve', subj: 'Boletín interno de septiembre', prev: 'Resumen de logros del mes y cumpleaños del personal.', clue: 'Boletín interno habitual.' },
    { type: 'safe', from: 'operaciones@suiche7b.com.ve', subj: 'Agenda de la reunión del lunes 10:00', prev: 'Temas: indicadores de la red interbancaria y servicio al cliente.', clue: 'Correo interno rutinario.' },
    { type: 'safe', from: 'tecnologia@suiche7b.com.ve', subj: 'Mantenimiento programado: viernes 6 PM', prev: 'Se reiniciarán los equipos. No se requiere ninguna acción ni clave.', clue: 'Informa sin pedir datos y viene del canal oficial.' },
    { type: 'safe', from: 'gestion.estrategica@suiche7b.com.ve', subj: 'Boletín interno ISO 9001:2015', prev: 'Resumen de logros del mes y avances de calidad de Corporación Suiche 7B.', clue: 'Boletín interno habitual.' },
    { type: 'safe', from: 'maria.perez@suiche7b.com.ve', subj: 'Minuta de la reunión de ayer', prev: 'Te dejo la minuta en Word para tus comentarios.', clue: 'Colega interna, adjunto esperado y tono normal.' },
    { type: 'safe', from: 'nomina@suiche7b.com.ve', subj: 'Tu recibo de pago ya está disponible', prev: 'Consúltalo en el portal de empleados al que accedes siempre.', clue: 'No pide clave ni trae enlaces extraños; remite al portal conocido.' },
    { type: 'safe', from: 'nuevos.negocios@suiche7b.com.ve', subj: 'Presentación oficial de QR S7B y NFC S7B', prev: 'Consúltala en la carpeta compartida interna de siempre.', clue: 'No pide clave ni trae enlaces extraños; remite al portal conocido.' },
    { type: 'safe', from: 'cumplimiento@suiche7b.com.ve', subj: 'Recordatorio: declaración anual', prev: 'Actualiza tu declaración en la intranet antes del viernes.', clue: 'Recordatorio interno de un trámite habitual.' },
    { type: 'safe', from: 'tecnologia@suiche7b.com.ve', subj: 'Nueva versión del sistema de reportes', prev: 'Ya está disponible; no necesitas hacer nada.', clue: 'Aviso informativo sin acciones sospechosas.' },
    { type: 'safe', from: 'capacitacion@suiche7b.com.ve', subj: 'Taller de atención al cliente (martes)', prev: 'Confirma tu asistencia respondiendo este correo.', clue: 'Invitación interna normal.' },
    { type: 'safe', from: 'presidencia@suiche7b.com.ve', subj: 'Felicitaciones por el cierre del trimestre', prev: 'Gracias por el esfuerzo de todos los equipos.', clue: 'Mensaje de reconocimiento sin pedir nada.' },
    { type: 'safe', from: 'auditoria.sistemas@suiche7b.com.ve', subj: 'Cronograma de revisión anual', prev: 'Ya está publicado en la intranet; no necesitas enviar claves.', clue: 'Aviso informativo sin acciones sospechosas.' },
    { type: 'safe', from: 'capital.humano@suiche7b.com.ve', subj: 'Taller de atención a instituciones afiliadas (martes)', prev: 'Confirma tu asistencia respondiendo este correo.', clue: 'Invitación interna normal.' },
    { type: 'safe', from: 'presidencia@suiche7b.com.ve', subj: 'Felicitaciones por el cierre del trimestre', prev: 'Gracias por el esfuerzo de todos los equipos de Corporación Suiche 7B.', clue: 'Mensaje de reconocimiento sin pedir nada.' },
    { type: 'safe', from: 'juan.rodriguez@suiche7b.com.ve', subj: '¿Almorzamos hoy?', prev: 'Te espero en la cafetería a las 12:00.', clue: 'Mensaje cotidiano entre compañeros.' },
    { type: 'safe', from: 'seguridad@suiche7b.com.ve', subj: 'Aviso: Seguridad nunca te pedirá tu clave', prev: 'Si alguien te la pide, repórtalo. Gracias por mantenerte alerta.', clue: 'Mensaje preventivo oficial, sin enlaces ni peticiones.' }
  ];

  class BandejaGame {
    stop() {
      this.playing = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
      if (this._key) document.removeEventListener('keydown', this._key);
      this._key = null;
    }

    open() {
      this.stop();
      const root = window.arcade.root(this.key);
      if (!root) return;
      const best = window.arcade.getBest(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('📥 Bandeja Blindada', best ? `Mejor puntaje: <strong>${best}</strong>` : '')}
        <div class="arc-intro single">
          <div class="arc-intro-text">
            <h2>Clasifica correos contra el reloj</h2>
            <p>Te llegan correos uno tras otro. Decide rápido: <strong>🚫 Fraude</strong> o <strong>✅ Seguro</strong>.
              Acumula <strong>combos</strong> para multiplicar tus puntos. Tienes <strong>90 segundos</strong> y <strong>3 vidas ❤️</strong>.</p>
            <ul>
              <li>👆 Arrastra la tarjeta a la <b>izquierda (fraude)</b> o a la <b>derecha (seguro)</b>, o usa los botones.</li>
              <li>⌨️ Teclado: <b>←</b> / <b>A</b> = Fraude · <b>→</b> / <b>D</b> = Seguro.</li>
              <li>🧐 Ojo: no todo correo es peligroso. ¡Equivocarte con uno seguro también cuesta una vida!</li>
            </ul>
            <button class="btn btn-primary" id="ban-go" style="padding:0.8rem 1.6rem;">▶ Comenzar</button>
          </div>
          <div class="arc-intro-visual"><div class="ban-demo-stack"><div class="ban-card demo d1">🚫</div><div class="ban-card demo d2">✅</div><div class="ban-card demo d3">📧</div></div></div>
        </div>`;
      U.$('ban-go').addEventListener('click', () => this.start());
    }

    start() {
      const phish = U.shuffle(MAILS.filter((m) => m.type === 'phish')).slice(0, 10);
      const safe = U.shuffle(MAILS.filter((m) => m.type === 'safe')).slice(0, 10);
      this.deck = U.shuffle([...phish, ...safe]);
      this.idx = 0; this.lives = 3; this.time = 90; this.combo = 0; this.bestCombo = 0; this.score = 0; this.correct = 0; this.mistakes = [];
      this.playing = true; this.busy = false;
      const root = window.arcade.root(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('📥 Bandeja Blindada', '<span class="arc-clock" id="ban-time">90s</span>')}
        <div class="ban-wrap">
          <div class="ban-hud">
            <span>❤️ <b id="ban-lives">3</b></span><span>⭐ <b id="ban-score">0</b></span>
            <span>🔥 Combo <b id="ban-combo">x1</b></span><span>📬 <b id="ban-left">20</b> por revisar</span>
          </div>
          <div class="arc-bar thin"><div id="ban-timebar" class="arc-bar-fill day" style="width:100%"></div></div>
          <div class="ban-stage" id="ban-stage"></div>
          <div class="ban-toast" id="ban-toast"></div>
          <div class="ban-btns">
            <button class="btn ban-btn-phish" id="ban-phish">⬅ 🚫 Es Fraude</button>
            <button class="btn ban-btn-safe" id="ban-safe">Es Seguro ✅ ➡</button>
          </div>
        </div>`;
      U.$('ban-phish').addEventListener('click', () => this.decide('phish'));
      U.$('ban-safe').addEventListener('click', () => this.decide('safe'));
      this._key = (e) => {
        if (!this.playing) return;
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.decide('phish');
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.decide('safe');
      };
      document.addEventListener('keydown', this._key);
      this.renderStack();
      this.last = performance.now();
      const loop = (ts) => {
        if (!this.playing) return;
        const dt = Math.min(0.1, (ts - this.last) / 1000);
        this.last = ts;
        this.time -= dt;
        const t = U.$('ban-time');
        if (t) t.textContent = `${Math.max(0, Math.ceil(this.time))}s`;
        const tb = U.$('ban-timebar');
        if (tb) tb.style.width = `${U.clamp((this.time / 90) * 100, 0, 100)}%`;
        if (this.time <= 0) { this.finish(); return; }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    renderStack() {
      const stage = U.$('ban-stage');
      if (!stage) return;
      stage.innerHTML = '';
      const cards = this.deck.slice(this.idx, this.idx + 3);
      for (let i = cards.length - 1; i >= 0; i--) {
        const m = cards[i];
        const el = document.createElement('div');
        el.className = `ban-card pos${i}`;
        el.innerHTML = `
          <div class="ban-stamp phish">FRAUDE</div><div class="ban-stamp safe">SEGURO</div>
          <div class="ban-from"><span>De:</span> ${U.esc(m.from)}</div>
          <div class="ban-subj">${U.esc(m.subj)}</div>
          <div class="ban-prev">${U.esc(m.prev)}</div>`;
        stage.appendChild(el);
        if (i === 0) this.bindDrag(el);
      }
      const left = U.$('ban-left');
      if (left) left.textContent = this.deck.length - this.idx;
    }

    bindDrag(el) {
      let sx = null, dx = 0;
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (e) => { sx = e.clientX; dx = 0; el.setPointerCapture && el.setPointerCapture(e.pointerId); el.classList.add('drag'); });
      el.addEventListener('pointermove', (e) => {
        if (sx === null) return;
        dx = e.clientX - sx;
        el.style.transform = `translateX(${dx}px) rotateZ(${dx * 0.05}deg) rotateY(${dx * 0.08}deg)`;
        el.style.setProperty('--sp', U.clamp(-dx / 120, 0, 1));
        el.style.setProperty('--ss', U.clamp(dx / 120, 0, 1));
      });
      const end = () => {
        if (sx === null) return;
        sx = null; el.classList.remove('drag');
        if (dx < -110) this.decide('phish');
        else if (dx > 110) this.decide('safe');
        else { el.style.transform = ''; el.style.setProperty('--sp', 0); el.style.setProperty('--ss', 0); }
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }

    decide(type) {
      if (!this.playing || this.busy) return;
      const card = this.deck[this.idx];
      if (!card) return;
      this.busy = true;
      const ok = card.type === type;
      const top = document.querySelector('#ban-stage .ban-card.pos0');
      if (top) {
        top.classList.add('fly');
        top.style.transform = `translateX(${type === 'phish' ? -700 : 700}px) rotateZ(${type === 'phish' ? -35 : 35}deg)`;
        top.style.opacity = '0';
      }
      if (ok) {
        this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
        const mult = Math.min(4, 1 + Math.floor(this.combo / 3));
        this.score += 10 * mult; this.correct++;
        U.snd('correct');
        this.toast(`✅ ${mult > 1 ? `Combo x${mult}! ` : ''}${card.clue}`, 'ok');
      } else {
        this.lives--; this.combo = 0; this.mistakes.push(card);
        U.snd('incorrect');
        this.toast(`❌ Era ${card.type === 'phish' ? 'FRAUDE' : 'SEGURO'}: ${card.clue}`, 'bad');
      }
      this.updateHud();
      this.idx++;
      setTimeout(() => {
        this.busy = false;
        if (!this.playing) return;
        if (this.lives <= 0 || this.idx >= this.deck.length) { this.finish(); return; }
        this.renderStack();
      }, 260);
    }

    toast(msg, kind) {
      const t = U.$('ban-toast');
      if (t) { t.className = `ban-toast show ${kind}`; t.textContent = msg; }
    }

    updateHud() {
      const set = (id, v) => { const el = U.$(id); if (el) el.textContent = v; };
      set('ban-lives', '❤️'.repeat(Math.max(0, this.lives)) || '💔');
      set('ban-score', this.score);
      set('ban-combo', `x${Math.min(4, 1 + Math.floor(this.combo / 3))}`);
    }

    async finish() {
      if (!this.playing) return;
      this.stop();
      const timeLeft = Math.max(0, Math.round(this.time));
      const raw = this.correct * 6 + this.bestCombo * 5 + Math.round(timeLeft * 0.6) + Math.max(0, this.lives) * 8;
      const awarded = await window.arcade.award(this.key, raw);
      const win = this.lives > 0 && this.idx >= this.deck.length;
      U.snd(win ? 'complete' : 'incorrect');
      const lessons = [];
      this.mistakes.forEach((m) => { const l = `<b>${U.esc(m.subj)}</b>: ${U.esc(m.clue)}`; if (!lessons.includes(l)) lessons.push(l); });
      const root = window.arcade.root(this.key);
      root.innerHTML = window.arcade.headerHTML('📥 Bandeja Blindada — Resultado') + window.arcade.resultHTML({
        emoji: win ? '🏆' : this.lives <= 0 ? '💔' : '⏰',
        title: win ? '¡Bandeja limpia!' : this.lives <= 0 ? 'Te quedaste sin vidas' : 'Se acabó el tiempo',
        subtitle: `Clasificaste ${this.correct} correos correctamente.`,
        stats: [['Puntaje', this.score], ['Aciertos', this.correct], ['Mejor combo', this.bestCombo], ['Vidas', Math.max(0, this.lives)]],
        lessons: lessons.slice(0, 5), awarded, win, retryJs: 'arcade.games.arcade_bandeja.open()'
      });
    }
  }

  // ===========================================================================
  // C) CAZA-FRAUDES: DUELO DE CARTAS
  // ===========================================================================
  const DEF = {
    verify: { n: 'Verificar por el teléfono de siempre', e: '📞' },
    dual: { n: 'Pedir doble firma de autorización', e: '✍️' },
    report: { n: 'Reportar a Seguridad de la Información', e: '🚨' },
    noclick: { n: 'No hacer clic ni abrir nada', e: '🛑' },
    hangup: { n: 'Colgar y avisar', e: '☎️' },
    lock: { n: 'Bloquear la pantalla (Win + L)', e: '🔒' },
    vpn: { n: 'Usar datos del celular y VPN', e: '📶' },
    mfa: { n: 'Tocar "NO FUI YO" y cambiar mi clave', e: '🔑' },
    shred: { n: 'Triturar el papel con datos', e: '🗑️' },
    usbsec: { n: 'Entregar a Seguridad sin conectar', e: '🔌' },
    badge: { n: 'Pedir identificación y verificar con quien lo contrató', e: '🪪' },
    // Cartas trampa
    hurry: { n: 'Responder rápido para no quedar mal', e: '⚡', trap: true },
    trust: { n: 'Confiar: parece de la empresa', e: '🤝', trap: true },
    share: { n: 'Compartir mi clave solo por hoy', e: '🔓', trap: true },
    ignore: { n: 'Ignorarlo y seguir trabajando', e: '🙈', trap: true }
  };

  const ATTACKS = [
    { n: 'Falso Jefe', e: '🎭', t: 'Un correo desde Gmail dice ser del Presidente y exige una transferencia urgente y secreta un viernes por la tarde.', best: ['verify', 'dual'], part: ['report'], x: 'Los pagos urgentes se confirman por teléfono interno y con doble firma; el secreto es una señal de fraude.' },
    { n: 'Enlace de Bloqueo', e: '🪝', t: 'Un correo avisa que tu cuenta se bloquea en 2 horas si no escribes tu clave en un enlace.', best: ['noclick', 'report'], part: ['verify'], x: 'La prisa y la amenaza son el truco. No hagas clic y avisa a Seguridad.' },
    { n: 'USB Regalo', e: '🎁', t: 'Encuentras una memoria USB nueva en el pasillo con la etiqueta "Sueldos 2026".', best: ['usbsec'], part: ['report'], x: 'Un dispositivo desconocido nunca se conecta: se entrega a Seguridad.' },
    { n: 'Falso Soporte', e: '📞', t: 'Alguien llama diciendo ser de Soporte y pide el código que te llegó por mensaje de texto.', best: ['hangup', 'report'], part: ['verify'], x: 'Soporte legítimo nunca pide códigos. Cuelga y avisa.' },
    { n: 'Cambio de Cuenta', e: '🏦', t: 'Un proveedor envía un PDF para cambiar su cuenta bancaria a nombre de otra persona.', best: ['verify', 'dual'], part: ['report'], x: 'Confirma con el teléfono guardado del proveedor, nunca con el que viene en la carta.' },
    { n: 'Wi-Fi Gratis', e: '📡', t: 'Estás en un aeropuerto y solo ves una red abierta llamada "WiFi_Gratis_Sin_Clave".', best: ['vpn'], part: ['lock'], x: 'Las redes abiertas permiten espiar. Usa datos del celular y VPN.' },
    { n: 'Avisos de Madrugada', e: '🌙', t: 'A las 11:48 PM tu celular vibra 7 veces preguntando si eres tú quien intenta entrar a tu cuenta.', best: ['mfa'], part: ['report'], x: 'Nunca aceptes un aviso que no iniciaste: alguien tiene tu clave.' },
    { n: 'QR Trampa', e: '🔳', t: 'Un volante ofrece un "bono especial" si escaneas un QR y pones tu usuario del trabajo.', best: ['noclick', 'report'], part: ['verify'], x: 'Un QR desconocido es un enlace sospechoso: no lo escanees.' },
    { n: 'Falso Técnico', e: '🦺', t: 'Un desconocido con chaleco pide pasar al piso para "revisar las computadoras".', best: ['badge', 'verify'], part: ['report'], x: 'Toda visita se valida antes de entrar, aunque traiga uniforme.' },
    { n: 'Papeles Olvidados', e: '📄', t: 'Hay hojas con cédulas y cuentas de clientes olvidadas sobre un escritorio y tu pantalla sigue abierta.', best: ['shred', 'lock'], part: [], x: 'Escritorio limpio: bloquea la pantalla y tritura o guarda lo impreso.' }
  ];

  class CartasGame {
    stop() { this.playing = false; }

    open() {
      this.stop();
      const root = window.arcade.root(this.key);
      if (!root) return;
      const best = window.arcade.getBest(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('🃏 Caza-Fraudes: Duelo de Cartas', best ? `Mejor puntaje: <strong>${best}</strong>` : '')}
        <div class="arc-intro single">
          <div class="arc-intro-text">
            <h2>Enfréntate a "El Estafador"</h2>
            <p>En cada ronda <strong>El Estafador lanza un ataque</strong> (un correo falso, una llamada, un USB…).
              Tú tienes <strong>4 cartas de defensa</strong>: elige la mejor para bloquearlo y golpear su plan.</p>
            <ul>
              <li>⭐ <b>Carta ideal</b>: bloqueas el ataque y le quitas mucha vida; las rachas dan daño extra.</li>
              <li>🟨 <b>Carta parcial</b>: ayuda, pero recibes algo de daño.</li>
              <li>🕳️ <b>Cartas trampa</b> ("Confiar", "Responder rápido"…): ¡te cuestan mucho escudo!</li>
              <li>🎯 8 rondas. Si tu escudo llega a 0, pierdes.</li>
            </ul>
            <button class="btn btn-primary" id="car-go" style="padding:0.8rem 1.6rem;">▶ Comenzar duelo</button>
          </div>
          <div class="arc-intro-visual"><div class="car-demo"><div class="car-card demo">🛡️</div><div class="car-card demo">📞</div><div class="car-card demo">🦹</div></div></div>
        </div>`;
      U.$('car-go').addEventListener('click', () => this.start());
    }

    start() {
      this.round = 0;
      this.hp = 100; this.ehp = 100; this.streak = 0; this.correct = 0; this.log = [];
      this.rounds = U.shuffle(ATTACKS).slice(0, 8);
      this.playing = true;
      const root = window.arcade.root(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('🃏 Caza-Fraudes: Duelo de Cartas', '<span class="arc-clock" id="car-round">Ronda 1/8</span>')}
        <div class="car-arena">
          <div class="car-top">
            <div class="car-bar-box"><span>🛡️ Tu escudo</span><div class="arc-bar"><div id="car-hp" class="arc-bar-fill" style="width:100%"></div></div><b id="car-hp-t">100</b></div>
            <div class="car-streak" id="car-streak"></div>
            <div class="car-bar-box right"><span>🦹 Plan del Estafador</span><div class="arc-bar"><div id="car-ehp" class="arc-bar-fill enemy" style="width:100%"></div></div><b id="car-ehp-t">100</b></div>
          </div>
          <div class="car-table">
            <div id="car-attack" class="car-attack"></div>
          </div>
          <div id="car-msg" class="car-msg"></div>
          <div id="car-hand" class="car-hand"></div>
          <div id="car-next" class="car-next"></div>
        </div>`;
      this.deal();
    }

    deal() {
      this.locked = false;
      const a = this.rounds[this.round];
      this.cur = a;
      U.$('car-round').textContent = `Ronda ${this.round + 1}/${this.rounds.length}`;
      U.$('car-attack').innerHTML = `
        <div class="car-card attack in"><div class="car-card-e">${a.e}</div><h3>${U.esc(a.n)}</h3><p>${U.esc(a.t)}</p><div class="car-tag">ATAQUE</div></div>`;
      U.$('car-msg').innerHTML = '<em>Elige tu carta de defensa:</em>';
      U.$('car-next').innerHTML = '';
      const best = U.pick(a.best);
      const others = Object.keys(DEF).filter((k) => !a.best.includes(k) && !a.part.includes(k));
      const hand = [best];
      if (a.part.length) hand.push(U.pick(a.part));
      const pool = U.shuffle(others);
      while (hand.length < 4) hand.push(pool.shift());
      this.hand = U.shuffle(hand);
      const box = U.$('car-hand');
      box.innerHTML = this.hand.map((k, i) => `
        <button class="car-card def in" data-i="${i}" style="animation-delay:${i * 0.08}s">
          <div class="car-card-e">${DEF[k].e}</div><h4>${U.esc(DEF[k].n)}</h4><div class="car-tag">${U.LETTERS[i]}</div>
        </button>`).join('');
      box.querySelectorAll('.car-card').forEach((el) => {
        el.addEventListener('click', () => this.play(parseInt(el.getAttribute('data-i'), 10)));
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--ry', `${((e.clientX - r.left) / (r.width || 1) - 0.5) * 22}deg`);
          el.style.setProperty('--rx', `${-((e.clientY - r.top) / (r.height || 1) - 0.5) * 22}deg`);
        });
        el.addEventListener('mouseleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
      });
      this.updateBars();
    }

    play(i) {
      if (this.locked || !this.playing) return;
      this.locked = true;
      const a = this.cur, k = this.hand[i], card = DEF[k];
      let res, msg;
      if (a.best.includes(k)) {
        const dmg = 22 + Math.min(this.streak, 3) * 4;
        this.ehp = Math.max(0, this.ehp - dmg);
        this.streak++; this.correct++; res = 'best';
        msg = `✅ <b>¡Defensa perfecta!</b> Bloqueaste el ataque y dañaste el plan del Estafador (−${dmg}).${this.streak > 1 ? ` 🔥 Racha x${this.streak}` : ''}`;
        U.snd('correct');
      } else if (a.part.includes(k)) {
        this.hp = Math.max(0, this.hp - 10); this.ehp = Math.max(0, this.ehp - 8); this.streak = 0; res = 'partial';
        msg = '🟨 <b>Defensa parcial.</b> Ayuda, pero no es lo ideal: recibiste −10 de escudo.';
        U.snd('click');
      } else {
        const d = card.trap ? 30 : 25;
        this.hp = Math.max(0, this.hp - d); this.streak = 0; res = 'wrong';
        msg = `❌ <b>${card.trap ? '¡Carta trampa!' : 'Esa carta no sirve aquí.'}</b> El ataque te golpeó (−${d} de escudo).`;
        U.snd('incorrect');
      }
      this.log.push({ a, res });
      const idealNames = a.best.map((b) => `${DEF[b].e} ${DEF[b].n}`).join(' · ');
      document.querySelectorAll('#car-hand .car-card').forEach((el, idx) => {
        const kk = this.hand[idx];
        el.classList.remove('in');
        el.classList.add(idx === i ? (res === 'wrong' ? 'hit' : 'played') : 'dim');
        if (a.best.includes(kk)) el.classList.add('ideal');
        el.disabled = true;
      });
      U.$('car-msg').innerHTML = `${msg}<br><span class="car-x">💡 Ideal: ${U.esc(idealNames)}. ${U.esc(a.x)}</span>`;
      this.updateBars();
      const over = this.hp <= 0 || this.ehp <= 0 || this.round >= this.rounds.length - 1;
      U.$('car-next').innerHTML = `<button class="btn btn-primary" id="car-nx">${over ? 'Ver resultado →' : 'Siguiente ataque →'}</button>`;
      U.$('car-nx').addEventListener('click', () => { U.snd('click'); if (over) this.finish(); else { this.round++; this.deal(); } });
    }

    updateBars() {
      const hp = U.$('car-hp'), ehp = U.$('car-ehp');
      if (hp) { hp.style.width = `${this.hp}%`; hp.style.background = this.hp > 60 ? '#22c55e' : this.hp > 30 ? '#f59e0b' : '#ef4444'; }
      if (ehp) ehp.style.width = `${this.ehp}%`;
      const set = (id, v) => { const el = U.$(id); if (el) el.textContent = v; };
      set('car-hp-t', this.hp); set('car-ehp-t', this.ehp);
      set('car-streak', this.streak > 1 ? `🔥 Racha x${this.streak}` : '');
    }

    async finish() {
      this.playing = false;
      const win = this.hp > 0;
      const raw = this.correct * 18 + this.hp * 0.6 + (win ? 20 : 0) + (this.ehp <= 0 ? 10 : 0);
      const awarded = await window.arcade.award(this.key, raw);
      U.snd(win ? 'complete' : 'incorrect');
      const lessons = [];
      this.log.filter((l) => l.res !== 'best').forEach((l) => { const t = `<b>${U.esc(l.a.n)}</b>: ${U.esc(l.a.x)}`; if (!lessons.includes(t)) lessons.push(t); });
      const root = window.arcade.root(this.key);
      root.innerHTML = window.arcade.headerHTML('🃏 Caza-Fraudes — Resultado') + window.arcade.resultHTML({
        emoji: this.ehp <= 0 ? '🏆' : win ? '🛡️' : '💥',
        title: this.ehp <= 0 ? '¡Derrotaste al Estafador!' : win ? 'Resististe los ataques' : 'El Estafador ganó esta vez',
        subtitle: `Defensas perfectas: ${this.correct} de ${this.log.length}.`,
        stats: [['Escudo final', this.hp], ['Plan del Estafador', this.ehp], ['Defensas ideales', this.correct], ['Rondas', this.log.length]],
        lessons: lessons.slice(0, 5), awarded, win, retryJs: 'arcade.games.arcade_cartas.open()'
      });
    }
  }

  // ===========================================================================
  // D) LA BÓVEDA DIGITAL (escape room 3D)
  // ===========================================================================
  const LOCKS = [
    { n: 'Claves', icon: '🔑', hint: 'Una buena clave es larga, mezcla palabras, números y símbolos, y no usa datos personales.' },
    { n: 'Correo falso', icon: '📧', hint: 'Revisa quién lo envía, a dónde lleva el enlace y si mete prisa.' },
    { n: 'Escritorio', icon: '🖥️', hint: 'Busca lo que cualquiera podría ver, copiar o llevarse. Son 4 cosas.' },
    { n: 'Llamada', icon: '☎️', hint: 'Primero no des datos, luego corta, después deja constancia y al final avisa.' },
    { n: 'Pago urgente', icon: '💸', hint: 'Dos acciones verifican el pedido por otro canal y con otra persona.' }
  ];

  class BovedaGame {
    stop() {
      this.playing = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
    }

    open() {
      this.stop();
      const root = window.arcade.root(this.key);
      if (!root) return;
      const best = window.arcade.getBest(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('🔐 La Bóveda Digital', best ? `Mejor puntaje: <strong>${best}</strong>` : '')}
        <div class="arc-intro">
          <div class="arc-intro-text">
            <h2>Escapa abriendo la bóveda</h2>
            <p>La bóveda de datos de Suiche 7B tiene <strong>5 candados</strong>. Cada uno esconde un acertijo de ciberseguridad.
            <p>La bóveda de datos de Corporación Suiche 7B tiene <strong>5 candados</strong>. Cada uno esconde un acertijo de ciberseguridad.
              Al resolverlo, el candado se enciende en verde en la bóveda 3D y te revela <strong>un dígito</strong>.
              Con los 5 dígitos abres la puerta.</p>
            <ul>
              <li>⏱️ Tienes <b>8 minutos</b>. Cada error resta tiempo.</li>
              <li>💡 Las pistas cuestan 30 segundos.</li>
              <li>🖱️ Arrastra sobre la bóveda 3D para girarla; toca un candado para ir a su acertijo.</li>
            </ul>
            <button class="btn btn-primary" id="bov-go" style="padding:0.8rem 1.6rem;">▶ Entrar a la bóveda</button>
          </div>
          <div class="arc-intro-visual"><canvas id="bov-preview" width="520" height="340"></canvas></div>
        </div>`;
      U.$('bov-go').addEventListener('click', () => this.start());
      const c = U.$('bov-preview');
      const eng = new Mini3D(c, { scale: 52, persp: 22, pitch: 0.12, yaw: 0, cy: 0.52 });
      this.playing = true;
      let t = 0;
      const loop = () => {
        const cv = U.$('bov-preview');
        if (!cv || !this.playing) return;
        t += 0.016;
        eng.yaw = Math.sin(t * 0.8) * 0.5;
        eng.clear();
        this._scene(eng, { t, solved: [true, false, true, false, false], open: 0 });
        eng.ctx.clearRect(0, 0, cv.width, cv.height);
        this._bg(eng.ctx, cv);
        eng.render();
        this.raf = requestAnimationFrame(loop);
      };
      loop();
    }

    _bg(ctx, cv) {
      const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, 40, cv.width / 2, cv.height / 2, cv.width * 0.7);
      g.addColorStop(0, '#1b2740'); g.addColorStop(1, '#070b16');
      ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    }

    static rotPoly(poly, a) {
      const c = Math.cos(a), s = Math.sin(a);
      return poly.map((p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c]);
    }

    _scene(e, s) {
      const ang = -s.open * 1.55; // la puerta se abre hacia el observador
      const px = -2.9;
      const c = Math.cos(ang), sn = Math.sin(ang);
      const xf = (v) => { const dx = v[0] - px; return [px + dx * c + v[2] * sn, v[1], -dx * sn + v[2] * c]; };
      const nf = (n) => [n[0] * c + n[2] * sn, n[1], -n[0] * sn + n[2] * c];
      // Suelo y pared
      e.addBox(0, -0.6, 0, 12, 0.5, 8, '#1f2a44', null, { layer: -3 });
      e.addBox(0, -0.1, -2.4, 12, 8, 0.4, '#27334f', null, { layer: -2 });
      // Marco e interior
      e.addExtrude(Mini3D.ngon(3.25, 12, Math.PI / 12), -0.9, -0.05, '#4b5563', null, { layer: -1 });
      e.addExtrude(Mini3D.ngon(2.6, 12, Math.PI / 12), -0.9, -0.04, '#fcd34d', null, { layer: -0.5, back: false });
      // Tesoro (datos protegidos)
      e.addBox(-0.9, -0.3, -0.5, 0.9, 0.5, 0.7, '#f59e0b', null, { layer: -0.4, emissive: 0.25 });
      e.addBox(0.3, -0.3, -0.4, 1.1, 0.8, 0.7, '#fbbf24', null, { layer: -0.4, emissive: 0.25 });
      e.addBox(1.3, -0.3, -0.5, 0.8, 0.4, 0.7, '#f59e0b', null, { layer: -0.4, emissive: 0.25 });
      // Puerta (con giro en la bisagra)
      const O = { xf, nf };
      e.addExtrude(Mini3D.ngon(2.8, 12, Math.PI / 12), 0, 0.5, '#9ca3af', 'door', Object.assign({ layer: 1 }, O));
      e.addExtrude(Mini3D.ngon(2.25, 12, Math.PI / 12), 0.5, 0.6, '#6b7280', 'door', Object.assign({ layer: 2 }, O));
      // Rueda central que gira
      const spin = s.t * 0.9 + s.open * 6;
      const bar = [[-0.95, -0.09], [0.95, -0.09], [0.95, 0.09], [-0.95, 0.09]];
      e.addExtrude(Mini3D.ngon(0.5, 10), 0.6, 0.85, '#d1d5db', 'door', Object.assign({ layer: 3 }, O));
      e.addExtrude(BovedaGame.rotPoly(bar, spin), 0.85, 0.95, '#e5e7eb', 'door', Object.assign({ layer: 4 }, O));
      e.addExtrude(BovedaGame.rotPoly(bar, spin + Math.PI / 2), 0.85, 0.95, '#e5e7eb', 'door', Object.assign({ layer: 4 }, O));
      // Candados
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2 + Math.PI / 5;
        const x = Math.cos(a) * 1.75, y = Math.sin(a) * 1.75;
        const ok = s.solved[i];
        e.addExtrude(Mini3D.ngon(0.3, 6, 0, x, y), 0.6, 0.9, ok ? '#22c55e' : '#ef4444', `lock${i}`,
          Object.assign({ layer: 5, emissive: ok ? 0.35 : 0.1 + 0.15 * Math.max(0, Math.sin(s.t * 4 + i)) }, O));
      }
      // Etiquetas numéricas de candados (solo si la puerta está cerrada)
      if (s.open < 0.05) {
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i / 5) * Math.PI * 2 + Math.PI / 5;
          e.addSprite(Math.cos(a) * 1.75, Math.sin(a) * 1.75, 1.05, {
            id: `lock${i}`, text: String(i + 1), r: 11, bg: s.solved[i] ? 'rgba(21,128,61,0.95)' : 'rgba(127,29,29,0.95)', border: '#fff'
          });
        }
      }
    }

    start() {
      this.stop();
      this.code = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
      this.solved = [false, false, false, false, false];
      this.timeLeft = 480; this.hints = 0; this.mistakes = 0; this.sel = 0;
      this.open = 0; this.opening = false; this.over = false; this.particles = [];
      this.t = 0; this.playing = true; this.drag = 0;
      const root = window.arcade.root(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('🔐 La Bóveda Digital', '<span class="arc-clock" id="bov-time">08:00</span>')}
        <div class="arc-jornada">
          <div class="arc-stage">
            <canvas id="bov-canvas" width="900" height="560"></canvas>
            <div class="arc-stage-hint">🖱️ Arrastra para girar la bóveda · Toca un candado numerado para ir a su acertijo</div>
          </div>
          <div class="arc-side">
            <div class="arc-hud">
              <div class="arc-hud-row"><span>🔢 Código de la bóveda</span><strong id="bov-code" class="bov-code">_ _ _ _ _</strong></div>
              <div class="bov-tabs" id="bov-tabs"></div>
            </div>
            <div id="bov-panel" class="arc-event"></div>
          </div>
        </div>`;
      const canvas = U.$('bov-canvas');
      this.eng = new Mini3D(canvas, { scale: 62, persp: 22, pitch: 0.12, yaw: 0, cy: 0.52 });
      let st = null;
      canvas.addEventListener('pointerdown', (ev) => { const p = Mini3D.canvasPoint(canvas, ev); st = { x: p.x, yaw: this.drag, moved: false, p }; });
      canvas.addEventListener('pointermove', (ev) => {
        if (!st) return;
        const p = Mini3D.canvasPoint(canvas, ev);
        if (Math.abs(p.x - st.x) > 4) st.moved = true;
        this.drag = U.clamp(st.yaw + (p.x - st.x) * 0.005, -0.7, 0.7);
      });
      canvas.addEventListener('pointerup', () => {
        if (st && !st.moved) {
          const id = this.eng.pick(st.p.x, st.p.y);
          if (id && id.startsWith('lock')) this.select(parseInt(id.slice(4), 10));
        }
        st = null;
      });
      canvas.addEventListener('pointerleave', () => { st = null; });
      this.renderTabs();
      this.select(0);
      this.last = performance.now();
      const loop = (ts) => {
        if (!this.playing || !U.$('bov-canvas')) return;
        const dt = Math.min(0.1, (ts - this.last) / 1000);
        this.last = ts;
        this.tick(dt);
        this.draw();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    tick(dt) {
      this.t += dt;
      if (!this.over) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false); return; }
      }
      if (this.opening) {
        this.open = Math.min(1, this.open + dt * 0.5);
        if (this.open >= 1 && !this.over) { this.over = true; setTimeout(() => this.finish(true), 1400); }
      }
      this.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.life -= dt; });
      this.particles = this.particles.filter((p) => p.life > 0);
    }

    draw() {
      const e = this.eng, cv = e.canvas;
      e.yaw = this.drag + Math.sin(this.t * 0.5) * 0.05;
      e.clear();
      this._scene(e, { t: this.t, solved: this.solved, open: this.open });
      e.ctx.clearRect(0, 0, cv.width, cv.height);
      this._bg(e.ctx, cv);
      e.render();
      if (this.open > 0.3) {
        e.ctx.fillStyle = `rgba(253,224,71,${(this.open - 0.3) * 0.15})`;
        e.ctx.fillRect(0, 0, cv.width, cv.height);
      }
      this.particles.forEach((p) => {
        e.ctx.fillStyle = p.c; e.ctx.globalAlpha = Math.min(1, p.life);
        e.ctx.fillRect(p.x, p.y, 6, 6);
      });
      e.ctx.globalAlpha = 1;
      const m = Math.floor(this.timeLeft / 60), s = Math.floor(this.timeLeft % 60);
      const t = U.$('bov-time');
      if (t) { t.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; t.style.color = this.timeLeft < 60 ? '#ef4444' : ''; }
    }

    burst() {
      const cv = this.eng.canvas;
      for (let i = 0; i < 90; i++) {
        this.particles.push({ x: cv.width / 2, y: cv.height / 2, vx: U.rnd(-260, 260), vy: U.rnd(-420, -80), life: U.rnd(1, 2.4), c: U.pick(['#fde047', '#22c55e', '#38bdf8', '#f472b6', '#fff']) });
      }
    }

    penalize(sec, msg) {
      this.timeLeft = Math.max(1, this.timeLeft - sec);
      this.mistakes++;
      U.snd('incorrect');
      this.say(`⏱️ −${sec} s · ${msg}`, 'bad');
    }

    say(msg, kind) {
      const el = U.$('bov-msg');
      if (el) { el.className = `bov-msg ${kind || ''}`; el.textContent = msg; }
    }

    renderTabs() {
      const el = U.$('bov-tabs');
      if (el) {
        el.innerHTML = LOCKS.map((l, i) => `<button class="bov-tab ${this.solved[i] ? 'done' : ''} ${this.sel === i ? 'sel' : ''}" data-i="${i}">${this.solved[i] ? '✅' : l.icon}<small>${i + 1}</small></button>`).join('');
        el.querySelectorAll('.bov-tab').forEach((b) => b.addEventListener('click', () => this.select(parseInt(b.getAttribute('data-i'), 10))));
      }
      const code = U.$('bov-code');
      if (code) code.textContent = this.code.map((d, i) => (this.solved[i] ? d : '_')).join(' ');
    }

    select(i) {
      if (this.over || this.opening) return;
      this.sel = i;
      U.snd('click');
      this.renderTabs();
      const p = U.$('bov-panel');
      if (!p) return;
      if (this.solved.every(Boolean)) { this.renderFinal(); return; }
      if (this.solved[i]) {
        p.innerHTML = `<h3>${LOCKS[i].icon} Candado ${i + 1}: ${LOCKS[i].n} ✅</h3><p>¡Resuelto! Dígito ${i + 1} del código: <b class="bov-digit">${this.code[i]}</b></p><p class="arc-hint-s">Elige otro candado pendiente.</p>`;
        return;
      }
      const builders = [this.p1, this.p2, this.p3, this.p4, this.p5];
      p.innerHTML = `<div class="jor-ev-tag">🔒 Candado ${i + 1} de 5 · ${LOCKS[i].n}</div><div id="bov-puz"></div><div id="bov-msg" class="bov-msg"></div>
        <button class="btn btn-secondary" id="bov-hint" style="margin-top:0.6rem; font-size:0.8rem;">💡 Pista (−30 s)</button>`;
      U.$('bov-hint').addEventListener('click', () => { this.hints++; this.timeLeft = Math.max(1, this.timeLeft - 30); this.say(`💡 ${LOCKS[i].hint}`, 'hint'); });
      builders[i].call(this, U.$('bov-puz'));
    }

    solve(i) {
      this.solved[i] = true;
      U.snd('correct');
      this.burst();
      this.renderTabs();
      const p = U.$('bov-panel');
      if (this.solved.every(Boolean)) { setTimeout(() => this.renderFinal(), 700); }
      p.innerHTML = `<h3>${LOCKS[i].icon} ¡Candado ${i + 1} abierto! ✅</h3><p>Dígito ${i + 1} del código: <b class="bov-digit">${this.code[i]}</b></p>
        <p class="arc-hint-s">${this.solved.every(Boolean) ? 'Todos los candados abiertos…' : 'Elige otro candado pendiente.'}</p>`;
    }

    // --- Candado 1: claves ---
    p1(box) {
      const opts = U.shuffle([
        { t: 'Suiche2026', ok: false, why: 'Usa el nombre de la empresa y el año: es de las primeras que prueban.' },
        { t: 'Mi*Perro-Come3Galletas!', ok: true },
        { t: '12345678', ok: false, why: 'Es la clave más usada del mundo; se adivina en segundos.' },
        { t: 'Maria1985', ok: false, why: 'Nombre y año de nacimiento: datos fáciles de averiguar.' }
      ]);
      box.innerHTML = `<h3>🔑 ¿Cuál es la clave más segura?</h3><p>Elige la mejor clave para tu cuenta del trabajo:</p>
        <div class="jor-opts">${opts.map((o, i) => `<button class="jor-opt" data-i="${i}"><span class="jor-opt-l">${U.LETTERS[i]}</span><span class="mono">${U.esc(o.t)}</span></button>`).join('')}</div>`;
      box.querySelectorAll('.jor-opt').forEach((b) => b.addEventListener('click', () => {
        const o = opts[parseInt(b.getAttribute('data-i'), 10)];
        if (o.ok) this.solve(0); else this.penalize(15, o.why);
      }));
    }

    // --- Candado 2: correo falso ---
    p2(box) {
      box.innerHTML = `<h3>📧 Encuentra las 3 señales de fraude</h3><p>Toca las partes sospechosas del correo:</p>
        <div class="bov-mail">
          <div><span class="m-l">De:</span> <span class="flag" data-f="1" data-w="El dominio 'suiche7b-ve.com' imita al oficial.">soporte@suiche7b-ve.com</span></div>
          <div><span class="m-l">Asunto:</span> <span class="flag" data-f="1" data-w="Meter prisa y amenazar es un truco típico.">URGENTE: responda en 2 horas o se cerrará su cuenta</span></div>
          <div class="m-body"><span class="flag" data-f="0">Estimado colaborador,</span> debe verificar su clave en este enlace:
            <span class="flag" data-f="1" data-w="Enlace externo y sin candado (http).">http://actualiza-clave.link/entrar</span><br>
            <span class="flag" data-f="0">Atentamente, Soporte Técnico</span></div>
        </div><div class="bov-count" id="bov-cnt">Señales encontradas: 0 / 3</div>`;
      let found = 0;
      box.querySelectorAll('.flag').forEach((el) => el.addEventListener('click', () => {
        if (el.classList.contains('found')) return;
        if (el.getAttribute('data-f') === '1') {
          el.classList.add('found'); found++; U.snd('click');
          this.say(`✔ ${el.getAttribute('data-w')}`, 'ok');
          U.$('bov-cnt').textContent = `Señales encontradas: ${found} / 3`;
          if (found >= 3) setTimeout(() => this.solve(1), 500);
        } else {
          this.penalize(6, 'Eso por sí solo no es sospechoso.');
        }
      }));
    }

    // --- Candado 3: escritorio ---
    p3(box) {
      const items = U.shuffle([
        { e: '📝', n: 'Nota adhesiva con una clave', risk: true },
        { e: '🖥️', n: 'Pantalla abierta sin nadie', risk: true },
        { e: '🔌', n: 'USB desconocida conectada', risk: true },
        { e: '📄', n: 'Papeles con cédulas a la vista', risk: true },
        { e: '🗄️', n: 'Gaveta con llave cerrada', risk: false },
        { e: '🪴', n: 'Una planta', risk: false },
        { e: '☕', n: 'Una taza de café', risk: false },
        { e: '🗑️', n: 'Triturador de papel', risk: false }
      ]);
      box.innerHTML = `<h3>🖥️ Arregla el escritorio inseguro</h3><p>Toca los <b>4 riesgos</b> para corregirlos:</p>
        <div class="bov-desk">${items.map((it, i) => `<button class="bov-item" data-i="${i}"><span>${it.e}</span><small>${U.esc(it.n)}</small></button>`).join('')}</div>
        <div class="bov-count" id="bov-cnt">Riesgos corregidos: 0 / 4</div>`;
      let fixed = 0;
      box.querySelectorAll('.bov-item').forEach((b) => b.addEventListener('click', () => {
        const it = items[parseInt(b.getAttribute('data-i'), 10)];
        if (b.classList.contains('fixed')) return;
        if (it.risk) {
          b.classList.add('fixed'); fixed++; U.snd('click');
          U.$('bov-cnt').textContent = `Riesgos corregidos: ${fixed} / 4`;
          this.say(`✔ ${it.n}: corregido.`, 'ok');
          if (fixed >= 4) setTimeout(() => this.solve(2), 500);
        } else {
          this.penalize(6, `"${it.n}" no es un riesgo.`);
        }
      }));
    }

    // --- Candado 4: orden de pasos ---
    p4(box) {
      const steps = ['Mantener la calma y no dar ningún dato', 'Colgar la llamada', 'Anotar número, hora y lo que pidieron', 'Reportar a Seguridad de la Información'];
      const shuffled = U.shuffle(steps.map((s, i) => ({ s, i })));
      box.innerHTML = `<h3>☎️ Llamada sospechosa: ¿en qué orden actúas?</h3><p>Una voz dice ser de "Soporte" y pide tu clave. Toca los pasos <b>en el orden correcto</b>:</p>
        <div class="bov-steps">${shuffled.map((o, k) => `<button class="bov-step" data-k="${k}"><span class="bov-step-n"></span>${U.esc(o.s)}</button>`).join('')}</div>`;
      let next = 0;
      const btns = [...box.querySelectorAll('.bov-step')];
      btns.forEach((b) => b.addEventListener('click', () => {
        const o = shuffled[parseInt(b.getAttribute('data-k'), 10)];
        if (b.classList.contains('chosen')) return;
        if (o.i === next) {
          b.classList.add('chosen'); b.querySelector('.bov-step-n').textContent = next + 1; next++; U.snd('click');
          if (next >= 4) setTimeout(() => this.solve(3), 500);
        } else {
          this.penalize(8, 'Ese no es el paso que sigue. Se reinicia el orden.');
          btns.forEach((x) => { x.classList.remove('chosen'); x.querySelector('.bov-step-n').textContent = ''; });
          next = 0;
        }
      }));
    }

    // --- Candado 5: pago urgente ---
    p5(box) {
      const opts = U.shuffle([
        { t: 'Llamar al teléfono que ya teníamos guardado', ok: true },
        { t: 'Pedir la doble firma de otra persona autorizada', ok: true },
        { t: 'Responder al correo preguntando si es cierto', ok: false },
        { t: 'Transferir primero y confirmar después', ok: false },
        { t: 'Confiar porque la voz suena como la del jefe', ok: false }
      ]);
      box.innerHTML = `<h3>💸 Pago urgente "del jefe"</h3><p>Te piden una transferencia urgente y secreta. Marca las <b>2 acciones correctas</b> y confirma:</p>
        <div class="bov-checks">${opts.map((o, i) => `<button class="bov-check" data-i="${i}"><span class="bov-box"></span>${U.esc(o.t)}</button>`).join('')}</div>
        <button class="btn btn-primary" id="bov-confirm" style="margin-top:0.6rem;">Confirmar</button>`;
      const sel = new Set();
      box.querySelectorAll('.bov-check').forEach((b) => b.addEventListener('click', () => {
        const i = parseInt(b.getAttribute('data-i'), 10);
        if (sel.has(i)) { sel.delete(i); b.classList.remove('on'); } else { sel.add(i); b.classList.add('on'); }
        U.snd('click');
      }));
      U.$('bov-confirm').addEventListener('click', () => {
        const chosen = [...sel];
        if (chosen.length === 2 && chosen.every((i) => opts[i].ok)) this.solve(4);
        else {
          this.penalize(15, 'Esa combinación no verifica el pedido por otro canal. Intenta de nuevo.');
          sel.clear(); box.querySelectorAll('.bov-check').forEach((b) => b.classList.remove('on'));
        }
      });
    }

    renderFinal() {
      const p = U.$('bov-panel');
      if (!p || this.over) return;
      p.innerHTML = `<h3>🔓 ¡Todos los candados abiertos!</h3>
        <p>Escribe el código de 5 dígitos que descubriste (míralo arriba) para abrir la puerta:</p>
        <div class="bov-keypad"><input id="bov-input" maxlength="5" inputmode="numeric" autocomplete="off" placeholder="_____"><button class="btn btn-primary" id="bov-open">🔓 Abrir bóveda</button></div>
        <div id="bov-msg" class="bov-msg"></div>`;
      U.$('bov-open').addEventListener('click', () => {
        const v = (U.$('bov-input').value || '').trim();
        if (v === this.code.join('')) { this.opening = true; U.snd('complete'); this.burst(); p.innerHTML = '<h3>🔓 ¡La bóveda se abre!</h3><p>Mira cómo gira la puerta…</p>'; }
        else this.penalize(10, 'Código incorrecto. Revisa los dígitos reunidos.');
      });
    }

    async finish(win) {
      if (this.finished) return;
      this.finished = true;
      this.playing = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      const left = Math.round(this.timeLeft);
      const solvedCount = this.solved.filter(Boolean).length;
      const raw = win ? 120 + Math.round(left * 0.3) + (this.hints === 0 ? 20 : 0) : solvedCount * 20;
      const awarded = await window.arcade.award(this.key, raw);
      U.snd(win ? 'complete' : 'incorrect');
      const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      const root = window.arcade.root(this.key);
      root.innerHTML = window.arcade.headerHTML('🔐 La Bóveda Digital — Resultado') + window.arcade.resultHTML({
        emoji: win ? '🏆' : '⏰',
        title: win ? '¡Bóveda abierta!' : 'Se acabó el tiempo',
        subtitle: win ? 'Protegiste los datos de Suiche 7B resolviendo los 5 candados.' : 'La bóveda sigue cerrada. ¡Inténtalo de nuevo!',
        subtitle: win ? 'Protegiste los datos de Corporación Suiche 7B resolviendo los 5 candados.' : 'La bóveda sigue cerrada. ¡Inténtalo de nuevo!',
        stats: [['Tiempo restante', mm], ['Errores', this.mistakes], ['Pistas usadas', this.hints], ['Candados', `${this.solved.filter(Boolean).length}/5`]],
        lessons: ['Usa claves largas y únicas con palabras, números y símbolos.', 'Revisa remitente, enlace y prisa antes de confiar en un correo.', 'Mantén el escritorio limpio y la pantalla bloqueada.', 'Ante una llamada sospechosa: no des datos, cuelga, anota y reporta.', 'Los pagos urgentes se verifican por otro canal y con doble firma.'],
        awarded, win, retryJs: 'arcade.games.arcade_boveda.open()'
      });
    }
  }

  window.arcade.register('arcade_bandeja', new BandejaGame());
  window.arcade.register('arcade_cartas', new CartasGame());
  window.arcade.register('arcade_boveda', new BovedaGame());
})();
