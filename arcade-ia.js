/**
 * Academia CiberSegura Corporación Suiche 7B - MÓDULO 5 FASE 2
 * FILTRO IA 3D: BUEN USO DE LA INTELIGENCIA ARTIFICIAL
 *
 * Juego interactivo 3D (Mini3D sobre Canvas 2D, sin GPU ni librerías externas):
 *  - Escena 3D interactiva en vivo: Estación Suiche 7B -> Escáner DLP 3D -> Nube IA Pública.
 *  - Rondas de Sanitización de Prompts (clic en fragmentos sensibles para censurarlos en tiempo real).
 *  - Rondas de Bloqueo de Documentos Confidenciales (Shadow AI).
 *  - Rondas de Verificación de Alucinaciones IA y Deepfake de Voz.
 */
(function () {
  'use strict';

  const { U, Mini3D } = window.arcade;

  const ROUNDS = [
    {
      id: 'ia_r1',
      mode: 'sanitize',
      badge: 'Ronda 1/6 · Censura de Prompt (DLP)',
      area: 'Operaciones y Servicio al Cliente',
      title: 'Redactar respuesta sobre Pago Móvil',
      context: 'Quieres usar un asistente de IA para mejorar la redacción de un correo a un cliente. Haz clic en los datos confidenciales para censurarlos antes de enviarlo a la IA.',
      action: 'send', // Debe censurar los fragmentos sensibles y luego enviar
      tokens: [
        { text: 'Redacta un correo cordial informando que el reclamo del usuario ', sensitive: false },
        { text: 'Carlos Mendoza (C.I. V-18.452.901)', sensitive: true, redacted: '[NOMBRE Y CÉDULA]' },
        { text: ' por su operación de Pago Móvil desde ', sensitive: false },
        { text: '0414-8829104 en Banco Aliado X', sensitive: true, redacted: '[TELÉFONO Y BANCO]' },
        { text: ' fue recibido y será atendido en las próximas 24 horas hábiles.', sensitive: false }
      ],
      okTitle: '¡Prompt limpio y seguro!',
      okMsg: 'Excelente: anonimizaste la identidad, cédula, teléfono y banco antes de consultar a la IA. Así obtienes una redacción profesional sin exponer datos personales ni de entidades aliadas.',
      badLeakMsg: '¡Alerta DLP! Enviaste datos reales de clientes o bancos aliados a una IA pública. Siempre censura nombres, cédulas, teléfonos y entidades antes de enviar.',
      badBlockMsg: 'En este caso SÍ podías usar la IA de forma segura: solo debías hacer clic en los 2 datos personales para anonimizarlos y luego enviar el prompt.',
      lesson: 'Anonimiza siempre nombres, cédulas, teléfonos y bancos aliados antes de redactar correos con IA.'
    },
    {
      id: 'ia_r2',
      mode: 'sanitize',
      badge: 'Ronda 2/6 · Censura Técnica (Credenciales)',
      area: 'Dirección Tecnología',
      title: 'Optimizar consulta de monitoreo QR S7B',
      context: 'Necesitas ayuda de una IA para optimizar una consulta de tiempos de respuesta en QR S7B. Tacha cualquier dato interno o secreto antes de enviarlo.',
      action: 'send',
      tokens: [
        { text: 'Optimiza esta consulta SQL que agrupa transacciones aprobadas por hora en ', sensitive: false },
        { text: 'prod-switch01.suiche7b.local (IP 10.24.8.15)', sensitive: true, redacted: '[SERVIDOR E IP INTERNA]' },
        { text: ' autenticada con ', sensitive: false },
        { text: 'API_KEY=sk_live_s7b_99482aF', sensitive: true, redacted: '[CREDENCIAL CENSURADA]' },
        { text: ' para reducir la latencia del reporte.', sensitive: false }
      ],
      okTitle: '¡Infraestructura protegida!',
      okMsg: 'Muy bien: eliminaste el nombre del servidor productivo, la IP interna y la API Key. La IA puede optimizar la lógica SQL sin conocer nada de nuestra red interbancaria.',
      badLeakMsg: '¡Fuga crítica! Nunca pegues IPs internas, nombres de servidores ni API Keys en IAs públicas; esos datos pueden quedar registrados o usarse en ataques dirigidos.',
      badBlockMsg: 'No hace falta bloquear la consulta completa: si ocultas el servidor, la IP y la API Key, puedes aprovechar la IA para mejorar la estructura genérica del SQL.',
      lesson: 'Jamás ingreses credenciales, API Keys, contraseñas ni direcciones IP internas en herramientas de IA.'
    },
    {
      id: 'ia_r3',
      mode: 'sanitize',
      badge: 'Ronda 3/6 · Shadow AI y Confidencialidad',
      area: 'Gerencia Capital Humano / Finanzas',
      title: 'Archivo completo de nómina corporativa',
      context: 'Te piden un resumen ejecutivo rápido de la nómina de Corporación Suiche 7B. Evalúa si debes censurar y enviar, o bloquear el uso de la IA pública.',
      action: 'block', // Documento estrictamente confidencial: debe bloquearse
      tokens: [
        { text: 'Adjunto el archivo completo ', sensitive: false },
        { text: 'Nomina_Confidencial_S7B_2026.xlsx', sensitive: true, redacted: '[ARCHIVO CONFIDENCIAL]' },
        { text: ' con los sueldos, bonos y ', sensitive: false },
        { text: 'cuentas bancarias de los colaboradores', sensitive: true, redacted: '[DATOS SALARIALES]' },
        { text: ' para que generes un análisis financiero en esta IA gratuita.', sensitive: false }
      ],
      okTitle: '¡Bloqueo correcto contra Shadow AI!',
      okMsg: 'Decisión impecable: los archivos completos de nómina, datos PCI-DSS o estados financieros confidenciales NO deben subirse a IAs públicas gratuitas. Deben procesarse solo en herramientas corporativas autorizadas.',
      badLeakMsg: '¡Fuga de información confidencial! Nunca subas archivos de nómina, contratos ni bases de datos reales a plataformas de IA públicas gratuitas.',
      badBlockMsg: '',
      lesson: 'Documentos confidenciales completos (nómina, PCI-DSS, contratos) nunca se suben a IAs públicas gratuitas.'
    },
    {
      id: 'ia_r4',
      mode: 'sanitize',
      badge: 'Ronda 4/6 · Uso Seguro y Productivo',
      area: 'Dirección Desarrollo Nuevos Negocios',
      title: 'Consejo público de seguridad para QR y NFC S7B',
      context: 'Quieres mejorar el tono de un consejo público para redes sociales. Revisa el texto cuidadosamente: si no tiene datos sensibles, ¡envíalo directo!',
      action: 'send',
      tokens: [
        { text: 'Mejora la claridad de este consejo público para nuestros usuarios: ', sensitive: false },
        { text: 'Antes de confirmar un pago con QR S7B o NFC S7B, verifica siempre el nombre del comercio y el monto en pantalla.', sensitive: false },
        { text: ' Organízalo en 3 viñetas breves y amigables.', sensitive: false }
      ],
      okTitle: '¡Buen uso de la IA!',
      okMsg: '¡Exacto! Este texto es 100% público y no expone datos confidenciales. La IA es una gran aliada para mejorar redacción, resumir información pública y ahorrar tiempo.',
      badLeakMsg: 'Censuraste fragmentos que eran completamente públicos. Recuerda que no hace falta ocultar información pública general; la clave es saber distinguir qué sí es confidencial.',
      badBlockMsg: 'Este caso era totalmente seguro para la IA: el contenido es un consejo público sin datos personales ni secretos corporativos.',
      lesson: 'La IA sí puede usarse para redactar, traducir y estructurar información pública o con datos ficticios.'
    },
    {
      id: 'ia_r5',
      mode: 'verify',
      badge: 'Ronda 5/6 · Detector de Alucinaciones IA',
      area: 'Oficial de Cumplimiento',
      title: '¿Confiarías en esta respuesta de la IA?',
      context: 'Le pediste a una IA un borrador sobre normativa bancaria para un informe. La IA respondió con tono muy seguro:',
      aiQuote: '“Según la Resolución SUDEBAN N.º 999-2026 (Art. 84), las redes interbancarias deben enviar sus llaves de cifrado por correo a los comercios afiliados cada trimestre.”',
      options: [
        {
          text: 'Verificar en la normativa oficial y corregir: la IA inventó una resolución y sugiere una práctica insegura.',
          correct: true,
          feedback: '¡Acertaste! Las IAs pueden "alucinar" artículos y resoluciones con total seguridad. Además, compartir llaves de cifrado por correo viola los controles de PCI-DSS y seguridad.'
        },
        {
          text: 'Copiar el párrafo directo al informe porque incluye el número exacto de resolución y artículo.',
          correct: false,
          feedback: 'Error: las citas con números muy precisos suelen ser alucinaciones. Nunca incluyas respuestas de IA en informes oficiales sin validar la fuente real.'
        },
        {
          text: 'Preguntarle a la misma IA "¿estás segura?" y usarlo si responde que sí.',
          correct: false,
          feedback: 'Error: una IA puede confirmar con seguridad su propia alucinación. Siempre contrasta con documentación oficial o con Cumplimiento / Seguridad.'
        }
      ],
      lesson: 'La IA puede inventar leyes, datos y fórmulas ("alucinaciones"): valida siempre en fuentes oficiales.'
    },
    {
      id: 'ia_r6',
      mode: 'verify',
      badge: 'Ronda 6/6 · Alerta Deepfake de Voz',
      area: 'Dirección Finanzas / Presidencia',
      title: 'Nota de voz urgente por WhatsApp',
      context: 'Recibes un audio por WhatsApp con la voz idéntica a la de un directivo de Corporación Suiche 7B:',
      aiQuote: '“Hola, estoy entrando a una reunión fuera de oficina y no tengo acceso al correo. Envíame ya el archivo de conciliación del día a auditoria.rapida@gmail.com, es urgente.”',
      options: [
        {
          text: 'No enviar el archivo, confirmar por canal corporativo oficial y reportar a Seguridad de la Información.',
          correct: true,
          feedback: '¡Excelente defensa! Con solo unos segundos de audio público, atacantes clonan voces con IA (deepfake). La urgencia + correo externo (@gmail.com) confirman el intento de fraude.'
        },
        {
          text: 'Enviar el archivo de inmediato porque reconoces perfectamente el tono de voz del directivo.',
          correct: false,
          feedback: 'Error crítico: el oído humano ya no basta para distinguir un deepfake de voz. Nunca envíes datos corporativos a correos personales por presión.'
        },
        {
          text: 'Pedirle por el mismo WhatsApp que envíe una foto para confirmar que es realmente él.',
          correct: false,
          feedback: 'Insuficiente: el atacante también puede generar imágenes falsas con IA o reutilizar fotos públicas. Valida siempre mediante llamada interna o canal corporativo oficial.'
        }
      ],
      lesson: 'Un deepfake de voz puede sonar idéntico a un directivo: verifica toda solicitud urgente por canal oficial.'
    }
  ];

  class FiltroIA3D {
    constructor() {
      this.raf = null;
      this.running = false;
      this.roundIdx = 0;
      this.score = 0;
      this.correctCount = 0;
      this.shield = 100;
      this.redactedSet = new Set();
      this.locked = false;
      this.results = [];
      this.t = 0;
      this.mouseYaw = 0;
      // Estado visual 3D del paquete de datos
      this.packet = { active: false, progress: 0, state: 'idle', direction: 1 };
      this.gatePulse = { color: '#38bdf8', intensity: 0 };
      this.shieldFlash = 0;
      this.sparks = [];
    }

    open() {
      this.stop();
      const root = window.arcade.root('arcade_ia');
      if (!root) return;
      root.innerHTML = `
        ${window.arcade.headerHTML('🤖 Filtro IA 3D: Buen Uso de la IA', '<span class="arc-pill">6 Casos · +250 PTS Máx</span>')}
        <div class="arc-intro ia3d-intro">
          <div class="arc-intro-grid">
            <div class="arc-intro-copy">
              <span class="sim3d-badge" style="border-color:#a855f7; color:#c084fc; display:inline-block; margin-bottom:0.85rem;">FASE 2 · FILTRO DLP &amp; IA 3D</span>
              <h2>Aprende a usar la IA sin filtrar datos de Corporación&nbsp;Suiche&nbsp;7B</h2>
              <p>Controla el <strong>Escáner DLP 3D</strong> entre tu estación corporativa y la Nube de IA. En cada misión deberás decidir si <strong>censurar datos sensibles antes de enviar</strong>, <strong>bloquear documentos confidenciales</strong> o <strong>detectar alucinaciones y deepfakes</strong>.</p>
              <div class="ia3d-how">
                <div class="ia3d-step"><span>1</span><div><strong>Haz clic en los datos sensibles</strong> dentro del prompt para censurarlos en tiempo real.</div></div>
                <div class="ia3d-step"><span>2</span><div><strong>Envía o Bloquea:</strong> observa el paquete viajar por el túnel 3D y cruzar el filtro DLP.</div></div>
                <div class="ia3d-step"><span>3</span><div><strong>Verifica la IA:</strong> detecta citas inventadas (alucinaciones) y audios clonados (deepfakes).</div></div>
              </div>
              <button class="btn btn-primary" style="margin-top:1.1rem; padding:0.85rem 1.8rem; font-size:1rem; background:linear-gradient(135deg,#7c3aed,#005e9c);" onclick="window._ia3d.start()">
                🚀 Iniciar Filtro IA 3D
              </button>
            </div>
            <div class="ia3d-preview-card">
              <canvas id="ia3d-intro-canvas" width="460" height="300"></canvas>
              <div class="ia3d-preview-cap">Motor 3D Interactivo · Escáner DLP Suiche 7B → Nube IA</div>
            </div>
          </div>
        </div>`;
      window._ia3d = this;
      this._startIntroCanvas();
    }

    _startIntroCanvas() {
      const cv = U.$('ia3d-intro-canvas');
      if (!cv) return;
      this.running = true;
      this.t = 0;
      const m = new Mini3D(cv, { yaw: 0.42, pitch: 0.44, scale: 34, persp: 16, cx: 0.5, cy: 0.56 });
      const loop = () => {
        if (!this.running || !document.getElementById('ia3d-intro-canvas')) return;
        this.t += 0.02;
        this._draw3DScene(m, cv, true);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    start() {
      this.stop();
      this.roundIdx = 0;
      this.score = 0;
      this.correctCount = 0;
      this.shield = 100;
      this.results = [];
      this.locked = false;
      this.redactedSet = new Set();
      this.packet = { active: false, progress: 0, state: 'idle', direction: 1 };
      this.gatePulse = { color: '#38bdf8', intensity: 0 };
      this.shieldFlash = 0;
      this.sparks = [];

      const root = window.arcade.root('arcade_ia');
      if (!root) return;
      root.innerHTML = `
        ${window.arcade.headerHTML('🤖 Filtro IA 3D: Buen Uso de la IA', '<span id="ia3d-hud-round" class="arc-pill">Ronda 1/6</span>')}
        <div class="ia3d-layout">
          <div class="ia3d-stage-wrap">
            <div class="ia3d-hud">
              <div class="ia3d-hud-item"><span>🛡️ Integridad DLP</span><strong id="ia3d-shield" style="color:#4ade80;">100%</strong></div>
              <div class="ia3d-hud-item"><span>⭐ Puntos</span><strong id="ia3d-score" style="color:#fbba0a;">0</strong></div>
              <div class="ia3d-hud-item"><span>📡 Estado</span><strong id="ia3d-status" style="color:#38bdf8;">En espera</strong></div>
            </div>
            <div class="ia3d-canvas-box">
              <canvas id="ia3d-canvas" width="760" height="300"></canvas>
              <div class="ia3d-canvas-hint">Mueve el cursor sobre la escena 3D para rotar la cámara</div>
            </div>
          </div>
          <div id="ia3d-panel" class="ia3d-panel"></div>
        </div>`;

      const cv = U.$('ia3d-canvas');
      if (cv) {
        cv.addEventListener('pointermove', (e) => {
          const r = cv.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / (r.width || 1)) - 0.5;
          this.mouseYaw = nx * 0.42;
        });
        cv.addEventListener('pointerleave', () => { this.mouseYaw = 0; });
      }

      this.running = true;
      this._startGameLoop();
      this.renderRound();
    }

    _startGameLoop() {
      const cv = U.$('ia3d-canvas');
      if (!cv) return;
      const m = new Mini3D(cv, { yaw: 0.22, pitch: 0.40, scale: 42, persp: 18, cx: 0.5, cy: 0.56 });
      const loop = () => {
        if (!this.running || !document.getElementById('ia3d-canvas')) return;
        this.t += 0.025;
        if (this.packet.active) {
          this.packet.progress += 0.032;
          if (this.packet.progress >= 1) {
            this.packet.progress = 1;
            if (this.packet.state === 'sending_ok') {
              this.packet.state = 'returning_ok';
              this.packet.progress = 0;
              this._spawnSparks(0, 1.0, 0, '#4ade80', 14);
            } else {
              this.packet.active = false;
            }
          }
          if (this.packet.state === 'sending_leak' && this.packet.progress >= 0.48) {
            this.packet.active = false;
            this.gatePulse = { color: '#ef4444', intensity: 1 };
            this._spawnSparks(0, 1.0, 0, '#ef4444', 22);
          }
        }
        if (this.gatePulse.intensity > 0) this.gatePulse.intensity = Math.max(0, this.gatePulse.intensity - 0.02);
        if (this.shieldFlash > 0) this.shieldFlash = Math.max(0, this.shieldFlash - 0.025);
        this.sparks = this.sparks.filter(s => {
          s.x += s.vx; s.y += s.vy; s.z += s.vz;
          s.vy -= 0.01;
          s.life -= 0.03;
          return s.life > 0;
        });
        this._draw3DScene(m, cv, false);
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    _spawnSparks(x, y, z, color, count) {
      for (let i = 0; i < count; i++) {
        this.sparks.push({
          x, y, z,
          vx: U.rnd(-0.14, 0.14),
          vy: U.rnd(0.03, 0.16),
          vz: U.rnd(-0.14, 0.14),
          color,
          life: 1
        });
      }
    }

    _draw3DScene(m, cv, isIntro) {
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const w = cv.width, h = cv.height;

      // Fondo espacial/cyber con degradado suave
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#071126');
      bg.addColorStop(1, '#0b1830');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Rejilla de horizonte sutil
      m.yaw = (isIntro ? Math.sin(this.t * 0.4) * 0.25 : this.mouseYaw + Math.sin(this.t * 0.35) * 0.08);
      m.clear();

      // Plataforma base y puente de datos 3D
      m.addBox(0, -0.35, 0, 10.2, 0.22, 3.2, '#0f223d', null, { layer: -2 });
      // Carril luminoso del túnel de datos
      const railColor = this.gatePulse.intensity > 0.2 ? this.gatePulse.color : '#1e3a5f';
      m.addBox(0, -0.12, 0, 7.6, 0.06, 0.75, railColor, null, { layer: -1, emissive: 0.25 });

      // 1. IZQUIERDA: Estación Corporativa Suiche 7B
      m.addBox(-3.6, -0.1, 0, 1.7, 1.5, 1.5, '#005e9c', null, { layer: 1 });
      m.addBox(-3.6, 1.4, 0, 1.35, 0.25, 1.15, '#0284c7', null, { layer: 2 });
      m.addBox(-3.6, 0.35, 0.77, 1.1, 0.65, 0.08, '#38bdf8', null, { layer: 2, emissive: 0.45 });
      m.addSprite(-3.6, 2.2, 0, { text: '🏢 SUICHE 7B', bg: 'rgba(0,94,156,0.88)', color: '#fff', size: 11 });

      // Escudo corporativo cuando se bloquea un documento confidencial
      if (this.shieldFlash > 0.05) {
        m.addBox(-2.2, 0, 0, 0.16, 2.1, 2.2, '#22c55e', null, { layer: 3, alpha: Math.min(0.85, this.shieldFlash), emissive: 0.6 });
      }

      // 2. CENTRO: Escáner DLP 3D (arco de seguridad)
      const gateCol = this.gatePulse.intensity > 0.1 ? this.gatePulse.color : '#0ea5e9';
      m.addBox(0, -0.1, -1.15, 0.42, 2.3, 0.42, '#1e293b', null, { layer: 1 });
      m.addBox(0, -0.1, 1.15, 0.42, 2.3, 0.42, '#1e293b', null, { layer: 1 });
      m.addBox(0, 2.15, 0, 0.55, 0.36, 2.75, '#0f172a', null, { layer: 2 });
      // Cortina láser DLP translúcida
      const laserAlpha = 0.22 + Math.sin(this.t * 4) * 0.08 + this.gatePulse.intensity * 0.45;
      m.addBox(0, 0.05, 0, 0.1, 2.05, 1.9, gateCol, null, { layer: 2, alpha: Math.min(0.85, laserAlpha), emissive: 0.7 });
      m.addSprite(0, 2.85, 0, { text: '🛡️ ESCÁNER DLP 3D', bg: 'rgba(15,23,42,0.9)', color: '#7dd3fc', size: 11 });

      // 3. DERECHA: Nube de IA Pública (núcleo flotante rotatorio)
      const bob = Math.sin(this.t * 1.8) * 0.18;
      const aiRot = this.t * 0.9;
      const xfAI = (v) => {
        const x = v[0] - 3.6, y = v[1] - (1.05 + bob), z = v[2];
        const ca = Math.cos(aiRot), sa = Math.sin(aiRot);
        return [3.6 + x * ca - z * sa, 1.05 + bob + y, x * sa + z * ca];
      };
      m.addBox(3.6, 0.5 + bob, 0, 1.15, 1.15, 1.15, '#7c3aed', null, { layer: 2, xf: xfAI, emissive: 0.3 });
      m.addBox(3.6, -0.1, 0, 1.5, 0.18, 1.5, '#3b0764', null, { layer: 0 });
      m.addSprite(3.6, 2.35, 0, { text: '🤖 NUBE IA PÚBLICA', bg: 'rgba(109,40,217,0.88)', color: '#f3e8ff', size: 11 });

      // 4. CUBOS 3D DE DATOS SENSIBLES EN ÓRBITA (reflejan en vivo las censuras del usuario)
      const round = !isIntro && ROUNDS[this.roundIdx];
      if (round && round.mode === 'sanitize') {
        const sensTokens = round.tokens.map((tk, i) => ({ tk, i })).filter(o => o.tk.sensitive);
        sensTokens.forEach((o, idx) => {
          const isRedacted = this.redactedSet.has(o.i);
          const ang = this.t * 1.4 + idx * (Math.PI * 2 / Math.max(1, sensTokens.length));
          const ox = -2.2 + Math.cos(ang) * 0.45;
          const oy = 0.9 + Math.sin(this.t * 2 + idx) * 0.2;
          const oz = Math.sin(ang) * 0.65;
          m.addBox(ox, oy, oz, 0.34, 0.34, 0.34, isRedacted ? '#22c55e' : '#ef4444', null, { layer: 3, emissive: 0.55 });
        });
      } else if (isIntro) {
        const px = -2.8 + ((this.t * 1.6) % 5.6);
        m.addBox(px, 0.55 + Math.sin(this.t * 5) * 0.1, 0, 0.42, 0.42, 0.42, px > 0 ? '#4ade80' : '#38bdf8', null, { layer: 3, emissive: 0.6 });
      }

      // 5. PAQUETE 3D EN TRÁNSITO AL ENVIAR
      if (this.packet.active) {
        let px = -3.0;
        let col = '#38bdf8';
        if (this.packet.state === 'sending_ok') {
          px = -3.0 + this.packet.progress * 6.0;
          col = this.packet.progress > 0.5 ? '#4ade80' : '#38bdf8';
        } else if (this.packet.state === 'returning_ok') {
          px = 3.0 - this.packet.progress * 6.0;
          col = '#fbba0a';
        } else if (this.packet.state === 'sending_leak') {
          px = -3.0 + this.packet.progress * 6.0;
          col = '#ef4444';
        }
        m.addBox(px, 0.65 + Math.sin(this.t * 8) * 0.08, 0, 0.52, 0.44, 0.44, col, null, { layer: 4, emissive: 0.7 });
      }

      // 6. CHISPAS 3D
      this.sparks.forEach(s => {
        m.addBox(s.x, s.y, s.z, 0.14, 0.14, 0.14, s.color, null, { layer: 5, alpha: s.life, emissive: 0.8 });
      });

      m.render();
    }

    renderRound() {
      const round = ROUNDS[this.roundIdx];
      if (!round) return this.finish();
      this.redactedSet = new Set();
      this.locked = false;

      const hudRound = U.$('ia3d-hud-round');
      if (hudRound) hudRound.textContent = `Ronda ${this.roundIdx + 1}/${ROUNDS.length}`;
      const statusEl = U.$('ia3d-status');
      if (statusEl) {
        statusEl.textContent = round.mode === 'sanitize' ? 'Revisa el prompt' : 'Analiza la alerta';
        statusEl.style.color = '#38bdf8';
      }

      const panel = U.$('ia3d-panel');
      if (!panel) return;

      if (round.mode === 'sanitize') {
        const sensitiveTotal = round.tokens.filter(t => t.sensitive).length;
        const promptHtml = round.tokens.map((tk, idx) => `
          <button type="button" class="ia3d-token" id="ia3d-tok-${idx}" onclick="window._ia3d.toggleToken(${idx})">${U.esc(tk.text)}</button>
        `).join('');

        panel.innerHTML = `
          <div class="ia3d-head-row">
            <span class="ia3d-badge">${U.esc(round.badge)}</span>
            <span class="ia3d-area">🏢 ${U.esc(round.area)}</span>
          </div>
          <h3 class="ia3d-title">${U.esc(round.title)}</h3>
          <p class="ia3d-context">${U.esc(round.context)}</p>
          <div class="ia3d-prompt-box">
            <div class="ia3d-prompt-label">
              <span>💬 Borrador de Prompt para IA Pública</span>
              <span id="ia3d-redact-counter" class="ia3d-counter">0 fragmentos censurados</span>
            </div>
            <div class="ia3d-prompt-body">${promptHtml}</div>
            <div class="ia3d-prompt-tip">💡 Haz clic sobre cualquier texto que contenga datos confidenciales para censurarlo antes de enviar${sensitiveTotal === 0 ? ' (o verifica si todo es público)' : ''}.</div>
          </div>
          <div class="ia3d-actions">
            <button class="btn btn-success" id="ia3d-btn-send" onclick="window._ia3d.submitSanitize('send')">
              🚀 Enviar Prompt a la IA
            </button>
            <button class="btn btn-danger" id="ia3d-btn-block" onclick="window._ia3d.submitSanitize('block')">
              🚫 Bloquear: No usar IA Pública
            </button>
          </div>
          <div id="ia3d-feedback" class="ia3d-feedback" style="display:none;"></div>`;
      } else {
        const shuffled = U.shuffle(round.options.map((o, i) => ({ ...o, origIdx: i })));
        this._currentVerifyOptions = shuffled;
        const optsHtml = shuffled.map((o, idx) => `
          <button type="button" class="ia3d-verify-opt" id="ia3d-vopt-${idx}" onclick="window._ia3d.submitVerify(${idx})">
            <span class="ia3d-opt-letter">${U.LETTERS[idx]}</span>
            <span>${U.esc(o.text)}</span>
          </button>
        `).join('');

        panel.innerHTML = `
          <div class="ia3d-head-row">
            <span class="ia3d-badge" style="border-color:#f472b6; color:#f9a8d4;">${U.esc(round.badge)}</span>
            <span class="ia3d-area">🏢 ${U.esc(round.area)}</span>
          </div>
          <h3 class="ia3d-title">${U.esc(round.title)}</h3>
          <p class="ia3d-context">${U.esc(round.context)}</p>
          <div class="ia3d-quote-box">${U.esc(round.aiQuote)}</div>
          <div class="ia3d-verify-list">${optsHtml}</div>
          <div id="ia3d-feedback" class="ia3d-feedback" style="display:none;"></div>`;
      }
    }

    toggleToken(idx) {
      if (this.locked) return;
      const round = ROUNDS[this.roundIdx];
      if (!round || !round.tokens[idx]) return;
      const tk = round.tokens[idx];
      const btn = U.$(`ia3d-tok-${idx}`);
      if (!btn) return;

      if (this.redactedSet.has(idx)) {
        this.redactedSet.delete(idx);
        btn.classList.remove('redacted');
        btn.textContent = tk.text;
        U.snd('click');
      } else {
        this.redactedSet.add(idx);
        btn.classList.add('redacted');
        btn.textContent = tk.redacted || '[CENSURADO]';
        U.snd('correct');
        this._spawnSparks(-2.2, 0.9, 0, '#4ade80', 8);
      }

      const counter = U.$('ia3d-redact-counter');
      if (counter) {
        const n = this.redactedSet.size;
        counter.textContent = `${n} ${n === 1 ? 'fragmento censurado' : 'fragmentos censurados'}`;
      }
    }

    submitSanitize(choice) {
      if (this.locked) return;
      this.locked = true;
      const round = ROUNDS[this.roundIdx];
      const sendBtn = U.$('ia3d-btn-send');
      const blockBtn = U.$('ia3d-btn-block');
      if (sendBtn) sendBtn.disabled = true;
      if (blockBtn) blockBtn.disabled = true;

      const sensIndices = round.tokens.map((t, i) => (t.sensitive ? i : -1)).filter(i => i >= 0);
      const missedSensitive = sensIndices.filter(i => !this.redactedSet.has(i));
      const overRedacted = [...this.redactedSet].filter(i => !round.tokens[i].sensitive);

      let isWin = false;
      let title = '';
      let msg = '';

      if (round.action === 'block') {
        if (choice === 'block') {
          isWin = true;
          title = round.okTitle;
          msg = round.okMsg;
          this.shieldFlash = 1;
          this.gatePulse = { color: '#4ade80', intensity: 0.9 };
          this._spawnSparks(-2.2, 1.0, 0, '#4ade80', 16);
        } else {
          isWin = false;
          title = '🚨 Fuga de Información Confidencial';
          msg = round.badLeakMsg;
          this.packet = { active: true, progress: 0, state: 'sending_leak', direction: 1 };
        }
      } else {
        // round.action === 'send'
        if (choice === 'block') {
          isWin = false;
          title = '⚠️ Bloqueo innecesario';
          msg = round.badBlockMsg;
          this.gatePulse = { color: '#fbba0a', intensity: 0.8 };
        } else if (missedSensitive.length === 0 && overRedacted.length === 0) {
          isWin = true;
          title = round.okTitle;
          msg = round.okMsg;
          this.packet = { active: true, progress: 0, state: 'sending_ok', direction: 1 };
          this.gatePulse = { color: '#4ade80', intensity: 0.9 };
        } else if (missedSensitive.length > 0) {
          isWin = false;
          title = '🚨 Alerta DLP: Dato Sensible Filtrado';
          msg = round.badLeakMsg;
          this.packet = { active: true, progress: 0, state: 'sending_leak', direction: 1 };
          missedSensitive.forEach(i => {
            const el = U.$(`ia3d-tok-${i}`);
            if (el) el.classList.add('missed-leak');
          });
        } else {
          // Censuró texto público cuando no hacía falta (ronda 4 o censura excesiva)
          isWin = false;
          title = '⚠️ Censura innecesaria';
          msg = round.badLeakMsg;
          this.gatePulse = { color: '#fbba0a', intensity: 0.8 };
        }
      }

      this._applyRoundOutcome(isWin, title, msg, round.lesson);
    }

    submitVerify(optIdx) {
      if (this.locked) return;
      this.locked = true;
      const round = ROUNDS[this.roundIdx];
      const chosen = this._currentVerifyOptions[optIdx];
      if (!chosen) return;

      this._currentVerifyOptions.forEach((o, i) => {
        const el = U.$(`ia3d-vopt-${i}`);
        if (!el) return;
        el.disabled = true;
        if (o.correct) el.classList.add('opt-correct');
        else if (i === optIdx && !o.correct) el.classList.add('opt-wrong');
      });

      if (chosen.correct) {
        this.gatePulse = { color: '#4ade80', intensity: 1 };
        this.shieldFlash = 0.9;
        this._spawnSparks(0, 1.1, 0, '#4ade80', 18);
      } else {
        this.gatePulse = { color: '#ef4444', intensity: 1 };
        this._spawnSparks(0, 1.1, 0, '#ef4444', 18);
      }

      this._applyRoundOutcome(
        chosen.correct,
        chosen.correct ? '✅ Verificación Correcta' : '🚨 Riesgo de IA no detectado',
        chosen.feedback,
        round.lesson
      );
    }

    _applyRoundOutcome(isWin, title, msg, lesson) {
      if (isWin) {
        this.correctCount++;
        this.score += 42;
        U.snd('correct');
      } else {
        this.shield = Math.max(0, this.shield - 20);
        U.snd('incorrect');
      }
      this.results.push({ ok: isWin, lesson });

      const scoreEl = U.$('ia3d-score');
      if (scoreEl) scoreEl.textContent = String(Math.min(250, this.score));
      const shieldEl = U.$('ia3d-shield');
      if (shieldEl) {
        shieldEl.textContent = `${this.shield}%`;
        shieldEl.style.color = this.shield >= 80 ? '#4ade80' : this.shield >= 40 ? '#fbba0a' : '#f87171';
      }
      const statusEl = U.$('ia3d-status');
      if (statusEl) {
        statusEl.textContent = isWin ? 'Filtro Aprobado' : 'Incidente DLP';
        statusEl.style.color = isWin ? '#4ade80' : '#f87171';
      }

      const fb = U.$('ia3d-feedback');
      if (fb) {
        const isLast = this.roundIdx >= ROUNDS.length - 1;
        fb.style.display = 'block';
        fb.className = `ia3d-feedback ${isWin ? 'ok' : 'bad'}`;
        fb.innerHTML = `
          <div class="ia3d-fb-title">${U.esc(title)}</div>
          <p>${U.esc(msg)}</p>
          <button class="btn btn-primary" style="margin-top:0.75rem;" onclick="window._ia3d.next()">
            ${isLast ? '🏁 Ver Resultados Finales' : 'Siguiente Caso →'}
          </button>`;
      }
    }

    next() {
      this.roundIdx++;
      if (this.roundIdx >= ROUNDS.length) {
        this.finish();
      } else {
        this.renderRound();
      }
    }

    async finish() {
      this.stop();
      const finalScore = Math.min(250, this.correctCount === ROUNDS.length ? 250 : this.score);
      const awarded = await window.arcade.award('arcade_ia', finalScore);
      const win = this.correctCount >= 4;
      const lessons = ROUNDS.map(r => r.lesson);
      const root = window.arcade.root('arcade_ia');
      if (!root) return;
      root.innerHTML = window.arcade.headerHTML('🤖 Filtro IA 3D: Buen Uso de la IA', '<span class="arc-pill">Completado</span>') +
        window.arcade.resultHTML({
          emoji: win ? '🤖' : '🛡️',
          title: win ? '¡Dominaste el Buen Uso de la IA!' : 'Entrenamiento de IA Completado',
          subtitle: win
            ? 'Protegiste los datos de Corporación Suiche 7B al aprovechar la IA de forma segura y verificada.'
            : 'Repasa las reglas clave de anonimización, Shadow AI, alucinaciones y deepfakes.',
          stats: [
            ['Casos Acertados', `${this.correctCount} / ${ROUNDS.length}`],
            ['Integridad DLP', `${this.shield}%`],
            ['Puntaje Obtenido', `${finalScore} PTS`]
          ],
          lessons,
          awarded,
          retryJs: 'window._ia3d.start()',
          win
        });
    }

    stop() {
      this.running = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    }
  }

  window.arcade.register('arcade_ia', new FiltroIA3D());
})();
