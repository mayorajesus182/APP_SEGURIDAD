/**
 * ARCADE A — "Escudo de Red 3D: Defiende el Suiche"
 * Juego de acción 3D en tiempo real (Mini3D) para Corporación Suiche 7B.
 * 3 oleadas rápidas (75 s total), sin tiempos muertos ni cuestionarios largos:
 * - Haz clic sobre las amenazas 3D para destruirlas con láser antes de que golpeen el núcleo.
 * - Deja pasar las operaciones legítimas de la red interbancaria (Pago Móvil S7B, QR S7B, NFC S7B, etc.).
 * - Cada 5 bloqueos seguidos carga el Pulso de Seguridad (limpia todas las amenazas en pantalla).
 */
(function () {
  'use strict';
  const { U, Mini3D } = window.arcade;

  const THREATS = [
    { e: '🎭', t: 'Falso Jefe @gmail', why: 'Presidencia Ejecutiva nunca ordena pagos urgentes desde Gmail.' },
    { e: '📎', t: 'Factura .EXE', why: 'Una factura legítima jamás es un programa ejecutable (.exe).' },
    { e: '🔌', t: 'USB del Pasillo', why: 'Las memorias USB desconocidas pueden contener virus automáticos.' },
    { e: '🔳', t: 'QR Trampa "Bono"', why: 'Los códigos QR con premios falsos roban contraseñas corporativas.' },
    { e: '☎️', t: 'Falso Soporte SMS', why: 'Tecnología jamás pide códigos de verificación por teléfono.' },
    { e: '🏦', t: 'Cambio Cuenta PDF', why: 'Todo cambio de cuenta de proveedor se valida por teléfono conocido.' },
    { e: '📡', t: 'Wi-Fi Gratis Café', why: 'Las redes abiertas permiten espiar archivos y contraseñas.' },
    { e: '🌙', t: '7 Avisos 11:48 PM', why: 'Si no iniciaste sesión, rechaza siempre los avisos nocturnos.' },
    { e: '📝', t: 'Clave en Post-it', why: 'Las contraseñas nunca se anotan en notas adhesivas visibles.' },
    { e: '📊', t: 'Nómina a Externo', why: 'Los datos de nómina jamás se envían a correos externos desconocidos.' },
    { e: '🤖', t: 'Sueldos en ChatGPT', why: 'Nunca pegues cédulas, sueldos ni datos privados en IA pública.' },
    { e: '💳', t: 'Foto Reverso CVV', why: 'Los 3 números del reverso (CVV) nunca se piden ni se guardan.' },
    { e: '🔗', t: 'suiche7b-ve.com', why: 'Dominio clonado: el oficial es @suiche7b.com.ve.' },
    { e: '🦺', t: 'Visita Sin Carnet', why: 'Toda persona externa debe validarse antes de ingresar.' },
    { e: '🎙️', t: 'Audio Clonado IA', why: 'Un deepfake de voz puede imitar a un directivo; confirma siempre por canal oficial.' },
    { e: '📦', t: 'Factura .ZIP', why: 'Los archivos comprimidos sospechosos suelen ocultar malware.' },
    { e: '💬', t: 'Clave por Chat', why: 'Nunca compartas contraseñas ni tokens por WhatsApp o mensajería.' }
  ];

  const LEGITS = [
    { e: '📱', t: 'Pago Móvil S7B', why: 'Operación legítima de Pago Móvil Interbancario.' },
    { e: '📲', t: 'Código QR S7B', why: 'Transacción oficial con estándar QR S7B.' },
    { e: '📶', t: 'Pago NFC S7B', why: 'Operación oficial sin contacto NFC S7B.' },
    { e: '🤝', t: 'Conciliación Aliado', why: 'Reporte oficial por canal validado con banco aliado.' },
    { e: '📧', t: 'Capital Humano', why: 'Comunicado interno oficial desde @suiche7b.com.ve.' },
    { e: '🔒', t: 'Pantalla Win + L', why: 'Buena práctica: bloquear el equipo al levantarse.' },
    { e: '🛡️', t: 'VPN Corporativa', why: 'Conexión cifrada oficial de Corporación Suiche 7B.' },
    { e: '💳', t: '4509 12** **** 4421', why: 'Número de tarjeta enmascarado correctamente en reportes.' },
    { e: '📋', t: 'Boletín ISO 9001', why: 'Comunicación oficial de Gerencia Gestión Estratégica.' },
    { e: '📞', t: 'Extensión Interna', why: 'Verificación telefónica por canal oficial interno.' }
  ];

  const WAVES = [
    { name: 'Oleada 1 · Mañana Activa', start: 0, spawn: 2.35, speed: 0.72, threatChance: 0.62 },
    { name: 'Oleada 2 · Hora Pico Interbancaria', start: 25, spawn: 1.75, speed: 0.96, threatChance: 0.68 },
    { name: 'Oleada 3 · ¡Ataque Coordinado!', start: 50, spawn: 1.32, speed: 1.18, threatChance: 0.74 }
  ];

  const TOTAL_TIME = 75;

  class EscudoRedGame {
    constructor() {
      this.running = false;
      this.raf = null;
      this.engine = null;
    }

    stop() {
      this.running = false;
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
        ${window.arcade.headerHTML('🛡️ Escudo de Red 3D: Defiende el Suiche', best ? `Mejor puntaje: <strong>${best}</strong>` : '')}
        <div class="arc-intro">
          <div class="arc-intro-text">
            <h2>Protege el núcleo de Corporación Suiche 7B en 75 segundos</h2>
            <p>Hacia el núcleo 3D viajan operaciones y amenazas. <strong>Sin esperas ni cuestionarios largos</strong>:
              demuestra tus reflejos y criterio en 3 oleadas rápidas.</p>
            <ul>
              <li>🎯 <strong>Haz clic sobre las amenazas</strong> (sospechosas) para destruirlas con el láser antes de que toquen el núcleo.</li>
              <li>✅ <strong>Deja pasar las operaciones legítimas</strong> (Pago Móvil S7B, QR S7B, NFC S7B, correos oficiales) para sumar puntos y recargar escudo.</li>
              <li>⚡ <strong>Pulso de Seguridad:</strong> bloquea 5 amenazas seguidas para cargar un pulso que limpia la pantalla (clic o barra espaciadora).</li>
            </ul>
            <button class="btn btn-primary" id="esc-go" style="padding:0.85rem 1.8rem; font-size:0.95rem;">
              ▶ Iniciar Defensa 3D (75 seg)
            </button>
          </div>
          <div class="arc-intro-visual"><canvas id="esc-preview" width="520" height="340"></canvas></div>
        </div>`;
      U.$('esc-go').addEventListener('click', () => this.start());
      this._previewLoop();
    }

    _previewLoop() {
      const c = U.$('esc-preview');
      if (!c) return;
      const eng = new Mini3D(c, { scale: 42, persp: 28, pitch: 0.56, yaw: 0, cy: 0.54 });
      this.running = true;
      let t = 0;
      const loop = () => {
        const cv = U.$('esc-preview');
        if (!cv || !this.running) return;
        t += 0.02;
        eng.yaw = t * 0.45;
        eng.clear();
        this._buildCore(eng, t, 100);
        // Cápsulas de muestra orbitando
        for (let i = 0; i < 4; i++) {
          const a = t * 0.8 + (i * Math.PI) / 2;
          const isT = i % 2 === 0;
          const x = Math.cos(a) * 3.8, z = Math.sin(a) * 3.8;
          eng.addBox(x, 0.35 + 0.15 * Math.sin(t * 4 + i), z, 0.8, 0.8, 0.8, isT ? '#ef4444' : '#22c55e', null, { emissive: 0.25 });
        }
        this._bg(eng.ctx, cv, t, 100);
        eng.render();
        this.raf = requestAnimationFrame(loop);
      };
      loop();
    }

    _bg(ctx, cv, t, shield) {
      const g = ctx.createRadialGradient(cv.width / 2, cv.height * 0.54, 30, cv.width / 2, cv.height * 0.54, cv.width * 0.65);
      g.addColorStop(0, shield < 35 ? '#2b1020' : '#0f2242');
      g.addColorStop(1, '#060a14');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
      // Anillos de radar en el plano
      ctx.save();
      ctx.strokeStyle = 'rgba(56,189,248,0.12)';
      ctx.lineWidth = 1;
      [110, 210, 320].forEach((r) => {
        ctx.beginPath();
        ctx.ellipse(cv.width / 2, cv.height * 0.55, r, r * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    }

    _buildCore(e, t, shield) {
      // Plataforma base octogonal
      const baseCol = shield > 60 ? '#1e3a5f' : shield > 30 ? '#5c4314' : '#5c1824';
      e.addBox(0, -0.35, 0, 2.5, 0.35, 2.5, baseCol, null, { layer: -2 });
      // Núcleo 3D rotando
      const a = t * 1.1;
      const c = Math.cos(a), s = Math.sin(a);
      const xf = (v) => [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c];
      const nf = (n) => [n[0] * c - n[2] * s, n[1], n[0] * s + n[2] * c];
      const coreCol = shield > 60 ? '#0ea5e9' : shield > 30 ? '#fbba0a' : '#ef4444';
      const yBob = 0.25 + 0.14 * Math.sin(t * 3);
      e.addBox(0, yBob, 0, 1.35, 1.35, 1.35, coreCol, 'core', { xf, nf, emissive: 0.28, layer: 1 });
      // Anillo dorado superior
      const a2 = -t * 1.6;
      const c2 = Math.cos(a2), s2 = Math.sin(a2);
      const xf2 = (v) => [v[0] * c2 - v[2] * s2, v[1], v[0] * s2 + v[2] * c2];
      const nf2 = (n) => [n[0] * c2 - n[2] * s2, n[1], n[0] * s2 + n[2] * c2];
      e.addBox(0, yBob + 0.55, 0, 2.1, 0.16, 0.22, '#fbba0a', null, { xf: xf2, nf: nf2, emissive: 0.35, layer: 2 });
      e.addBox(0, yBob + 0.55, 0, 0.22, 0.16, 2.1, '#b60e80', null, { xf: xf2, nf: nf2, emissive: 0.35, layer: 2 });
      // 4 nodos orbitales (Pago Móvil, QR, NFC, Cajeros)
      for (let i = 0; i < 4; i++) {
        const oa = t * 0.9 + (i * Math.PI) / 2;
        e.addBox(Math.cos(oa) * 1.9, 0.15, Math.sin(oa) * 1.9, 0.34, 0.34, 0.34, '#38bdf8', null, { emissive: 0.3, layer: 0 });
      }
    }

    start() {
      this.stop();
      this.elapsed = 0;
      this.t = 0;
      this.shield = 100;
      this.score = 0;
      this.blocked = 0;
      this.legitPassed = 0;
      this.friendlyFire = 0;
      this.leaked = 0;
      this.streak = 0;
      this.bestStreak = 0;
      this.empCharge = 0;
      this.empUsed = 0;
      this.spawnTimer = 0.4;
      this.nextId = 1;
      this.packets = [];
      this.lasers = [];
      this.particles = [];
      this.floaters = [];
      this.empWave = 0;
      this.flash = 0;
      this.shake = 0;
      this.mistakes = [];
      this.waveIdx = 0;
      this.ended = false;
      this.dragYaw = 0;
      this.threatBag = U.shuffle(THREATS);
      this.legitBag = U.shuffle(LEGITS);
      this.lastThreatLabel = '';
      this.lastLegitLabel = '';

      const root = window.arcade.root(this.key);
      root.innerHTML = `
        ${window.arcade.headerHTML('🛡️ Escudo de Red 3D: Defiende el Suiche', '<span id="esc-time" class="arc-clock">01:15</span>')}
        <div class="esc-wrap">
          <div class="esc-hud">
            <div class="esc-hud-item">
              <span>🛡️ Núcleo</span>
              <div class="arc-bar" style="width:120px; margin:0;"><div id="esc-shield" class="arc-bar-fill" style="width:100%"></div></div>
              <strong id="esc-shield-t">100%</strong>
            </div>
            <div class="esc-hud-item"><span id="esc-wave" class="esc-wave-pill">Oleada 1 · Mañana Activa</span></div>
            <div class="esc-hud-item"><span>⭐ <b id="esc-score">0</b></span><span>🔥 Racha <b id="esc-streak">0</b></span><span>🚫 <b id="esc-blk">0</b></span></div>
            <button type="button" id="esc-emp" class="btn btn-secondary esc-emp-btn" disabled>⚡ Pulso (0/5)</button>
          </div>
          <div class="arc-stage esc-stage">
            <canvas id="esc-canvas" width="920" height="520"></canvas>
            <div id="esc-toast" class="esc-toast">🎯 Haz clic en las cápsulas de <b>AMENAZA</b> para destruirlas · Deja pasar las operaciones <b>LEGÍTIMAS</b></div>
          </div>
        </div>`;

      const cv = U.$('esc-canvas');
      this.engine = new Mini3D(cv, { scale: 44, persp: 30, pitch: 0.56, yaw: 0, cy: 0.55 });
      U.$('esc-emp').addEventListener('click', () => this.fireEmp());

      this._key = (e) => {
        if (!this.running || this.ended) return;
        if (e.code === 'Space') { e.preventDefault(); this.fireEmp(); }
      };
      document.addEventListener('keydown', this._key);

      cv.addEventListener('pointerdown', (ev) => {
        if (!this.running || this.ended) return;
        const p = Mini3D.canvasPoint(cv, ev);
        this.handleClick(p.x, p.y);
      });

      this.running = true;
      this.lastTs = performance.now();
      const loop = (ts) => {
        if (!this.running || !U.$('esc-canvas')) return;
        const dt = Math.min(0.1, (ts - this.lastTs) / 1000);
        this.lastTs = ts;
        this.tick(dt);
        this.draw();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    _drawFromBag(isThreat) {
      let bag = isThreat ? this.threatBag : this.legitBag;
      const src = isThreat ? THREATS : LEGITS;
      const last = isThreat ? this.lastThreatLabel : this.lastLegitLabel;
      if (!bag || bag.length === 0) {
        bag = U.shuffle(src);
        if (bag.length > 1 && bag[bag.length - 1].t === last) {
          [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
        }
        if (isThreat) this.threatBag = bag; else this.legitBag = bag;
      }
      const item = bag.pop();
      if (isThreat) this.lastThreatLabel = item.t; else this.lastLegitLabel = item.t;
      return item;
    }

    spawnPacket() {
      const w = WAVES[this.waveIdx] || WAVES[2];
      const isThreat = Math.random() < w.threatChance;
      const item = this._drawFromBag(isThreat);
      // Elegir un ángulo que no se monte encima de otro paquete recién creado
      let angle = U.rnd(0, Math.PI * 2);
      for (let tries = 0; tries < 6; tries++) {
        const clash = this.packets.some((p) => p.dist > 5.2 && Math.abs(Math.atan2(Math.sin(p.angle - angle), Math.cos(p.angle - angle))) < 0.65);
        if (!clash) break;
        angle = U.rnd(0, Math.PI * 2);
      }
      this.packets.push({
        id: this.nextId++,
        isThreat,
        e: item.e,
        t: item.t,
        why: item.why,
        angle,
        dist: 7.4,
        speed: w.speed * U.rnd(0.92, 1.12),
        spin: U.rnd(0, Math.PI * 2),
        sx: 0,
        sy: 0
      });
    }

    handleClick(px, py) {
      // Buscar la cápsula más cercana al clic (radio amplio para clic cómodo en la cápsula o su etiqueta)
      let hit = null, bestD = 58;
      for (const pk of this.packets) {
        const d = Math.hypot(px - pk.sx, py - pk.sy);
        const dLbl = Math.hypot(px - pk.sx, py - (pk.sy + 24));
        const minD = Math.min(d, dLbl);
        if (minD < bestD) { bestD = minD; hit = pk; }
      }
      if (!hit) return;

      const coreP = this.engine.project([0, 0.9, 0]);
      this.lasers.push({ x1: coreP.x, y1: coreP.y, x2: hit.sx, y2: hit.sy, col: hit.isThreat ? '#38bdf8' : '#f59e0b', life: 0.25 });
      this.packets = this.packets.filter((x) => x !== hit);

      if (hit.isThreat) {
        this.blocked++;
        this.streak++;
        this.bestStreak = Math.max(this.bestStreak, this.streak);
        this.empCharge = Math.min(5, this.empCharge + 1);
        const mult = Math.min(3, 1 + Math.floor(this.streak / 4));
        const pts = 15 * mult;
        this.score += pts;
        this.burst(hit.sx, hit.sy, '#38bdf8', 18);
        this.floaters.push({ x: hit.sx, y: hit.sy - 10, text: `+${pts}${mult > 1 ? ` x${mult}` : ''}`, col: '#4ade80', life: 0.95 });
        U.snd('correct');
        this.toast(`✅ Bloqueaste "${hit.t}": ${hit.why}`, 'ok');
      } else {
        this.friendlyFire++;
        this.streak = 0;
        this.score = Math.max(0, this.score - 5);
        this.burst(hit.sx, hit.sy, '#fbba0a', 12);
        this.floaters.push({ x: hit.sx, y: hit.sy - 10, text: '¡Era legítimo! -5', col: '#fbba0a', life: 1.1 });
        U.snd('incorrect');
        this.toast(`⚠️ ¡Era legítimo! "${hit.t}" debía pasar: ${hit.why}`, 'warn');
        this.mistakes.push(`No bloquees <b>${U.esc(hit.t)}</b>: ${U.esc(hit.why)}`);
      }
      this.updateHud();
    }

    fireEmp() {
      if (!this.running || this.ended || this.empCharge < 5) return;
      this.empCharge = 0;
      this.empUsed++;
      this.empWave = 1;
      U.snd('complete');
      let cleared = 0;
      const keep = [];
      for (const pk of this.packets) {
        if (pk.isThreat) {
          cleared++;
          this.blocked++;
          this.score += 15;
          this.burst(pk.sx, pk.sy, '#fbba0a', 20);
          this.floaters.push({ x: pk.sx, y: pk.sy, text: '⚡ +15', col: '#fde047', life: 1 });
        } else {
          keep.push(pk);
        }
      }
      this.packets = keep;
      this.toast(`⚡ ¡Pulso de Seguridad activado! ${cleared} amenazas neutralizadas sin afectar el tráfico legítimo.`, 'ok');
      this.updateHud();
    }

    burst(x, y, col, n) {
      for (let i = 0; i < n; i++) {
        const a = U.rnd(0, Math.PI * 2), sp = U.rnd(60, 220);
        this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, col, life: U.rnd(0.35, 0.75) });
      }
    }

    toast(msg, kind) {
      const el = U.$('esc-toast');
      if (el) { el.className = `esc-toast ${kind || ''}`; el.textContent = msg; }
    }

    tick(dt) {
      if (this.ended) return;
      this.t += dt;
      this.elapsed += dt;
      this.flash = Math.max(0, this.flash - dt * 2.2);
      this.shake = Math.max(0, this.shake - dt * 3);
      this.empWave = Math.max(0, this.empWave - dt * 1.4);

      // Cambio de oleada
      const newWave = this.elapsed >= 50 ? 2 : this.elapsed >= 25 ? 1 : 0;
      if (newWave !== this.waveIdx) {
        this.waveIdx = newWave;
        U.snd('incident_alert');
        this.toast(`🚀 ¡${WAVES[newWave].name}! Mantente alerta.`, 'warn');
        const wEl = U.$('esc-wave');
        if (wEl) wEl.textContent = WAVES[newWave].name;
      }

      // Generación de cápsulas
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.packets.length < 7) {
        this.spawnPacket();
        this.spawnTimer = WAVES[this.waveIdx].spawn * U.rnd(0.85, 1.15);
      }

      // Movimiento hacia el núcleo
      for (const pk of [...this.packets]) {
        pk.dist -= pk.speed * dt;
        pk.spin += dt * 2.2;
        if (pk.dist <= 1.25) {
          this.packets = this.packets.filter((x) => x !== pk);
          const cp = this.engine.project([0, 0.8, 0]);
          if (pk.isThreat) {
            this.leaked++;
            this.streak = 0;
            this.shield = Math.max(0, this.shield - 16);
            this.flash = 1;
            this.shake = 1;
            this.burst(cp.x, cp.y, '#ef4444', 22);
            this.floaters.push({ x: cp.x, y: cp.y - 25, text: `💥 -16% (${pk.t})`, col: '#f87171', life: 1.3 });
            U.snd('incorrect');
            this.toast(`🚨 Impacto de "${pk.t}": ${pk.why}`, 'bad');
            this.mistakes.push(`<b>${U.esc(pk.t)}</b>: ${U.esc(pk.why)}`);
            if (this.shield <= 0) { this.finish(false); return; }
          } else {
            this.legitPassed++;
            this.score += 12;
            this.shield = Math.min(100, this.shield + 2);
            this.burst(cp.x, cp.y, '#22c55e', 10);
            this.floaters.push({ x: cp.x, y: cp.y - 20, text: `✅ +12`, col: '#86efac', life: 0.85 });
          }
          this.updateHud();
        }
      }

      this.lasers.forEach((l) => { l.life -= dt; });
      this.lasers = this.lasers.filter((l) => l.life > 0);
      this.particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
      this.particles = this.particles.filter((p) => p.life > 0);
      this.floaters.forEach((f) => { f.y -= 32 * dt; f.life -= dt; });
      this.floaters = this.floaters.filter((f) => f.life > 0);

      if (this.elapsed >= TOTAL_TIME) this.finish(true);
    }

    updateHud() {
      const s = Math.round(this.shield);
      const bar = U.$('esc-shield');
      if (bar) { bar.style.width = `${s}%`; bar.style.background = s > 60 ? '#22c55e' : s > 30 ? '#f59e0b' : '#ef4444'; }
      const set = (id, v) => { const el = U.$(id); if (el) el.textContent = v; };
      set('esc-shield-t', `${s}%`);
      set('esc-score', this.score);
      set('esc-streak', this.streak);
      set('esc-blk', this.blocked);
      const emp = U.$('esc-emp');
      if (emp) {
        const ready = this.empCharge >= 5;
        emp.disabled = !ready;
        emp.textContent = ready ? '⚡ ¡LANZAR PULSO!' : `⚡ Pulso (${this.empCharge}/5)`;
        emp.className = `btn ${ready ? 'btn-primary esc-emp-ready' : 'btn-secondary'} esc-emp-btn`;
      }
    }

    draw() {
      const e = this.engine, cv = e.canvas, ctx = e.ctx;
      e.yaw = Math.sin(this.t * 0.25) * 0.14;
      e.clear();
      this._buildCore(e, this.t, this.shield);

      // Agregar cápsulas 3D
      for (const pk of this.packets) {
        const x = Math.cos(pk.angle) * pk.dist;
        const z = Math.sin(pk.angle) * pk.dist;
        const y = 0.45 + 0.12 * Math.sin(this.t * 5 + pk.id);
        const c = Math.cos(pk.spin), s = Math.sin(pk.spin);
        const xf = (v) => {
          const dx = v[0] - x, dz = v[2] - z;
          return [x + dx * c - dz * s, v[1], z + dx * s + dz * c];
        };
        const nf = (n) => [n[0] * c - n[2] * s, n[1], n[0] * s + n[2] * c];
        // Todas las cápsulas usan el mismo color holográfico neutro para que el jugador decida por el contenido
        e.addBox(x, y, z, 0.78, 0.78, 0.78, '#1d4ed8', `pk_${pk.id}`, { xf, nf, emissive: 0.25, layer: 2 });
        const pr = e.project([x, y + 0.4, z]);
        pk.sx = pr.x;
        pk.sy = pr.y;
      }

      ctx.save();
      if (this.shake > 0) {
        ctx.translate(U.rnd(-6, 6) * this.shake, U.rnd(-4, 4) * this.shake);
      }
      ctx.clearRect(0, 0, cv.width, cv.height);
      this._bg(ctx, cv, this.t, this.shield);
      e.render();

      // Etiquetas limpias sobre cada cápsula 3D
      for (const pk of this.packets) {
        const lbl = `${pk.e} ${pk.t}`;
        ctx.font = '700 12px Inter, sans-serif';
        const w = ctx.measureText(lbl).width + 18;
        const bx = pk.sx - w / 2, by = pk.sy + 14;
        ctx.fillStyle = 'rgba(10, 18, 36, 0.92)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, w, 24, 6) : ctx.rect(bx, by, w, 24);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, pk.sx, by + 12);
      }

      // Rayos láser 3D
      for (const l of this.lasers) {
        ctx.strokeStyle = l.col;
        ctx.lineWidth = 4 * (l.life / 0.25);
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      }

      // Onda expansiva EMP
      if (this.empWave > 0) {
        const cp = e.project([0, 0.5, 0]);
        const r = (1 - this.empWave) * 440;
        ctx.strokeStyle = `rgba(251, 186, 10, ${this.empWave})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cp.x, cp.y, r, r * 0.54, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Partículas y textos flotantes
      for (const p of this.particles) {
        ctx.fillStyle = p.col;
        ctx.globalAlpha = Math.min(1, p.life * 1.5);
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      ctx.globalAlpha = 1;
      ctx.font = '800 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (const f of this.floaters) {
        ctx.fillStyle = f.col;
        ctx.globalAlpha = Math.min(1, f.life);
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;

      if (this.flash > 0) {
        ctx.fillStyle = `rgba(239,68,68,${this.flash * 0.3})`;
        ctx.fillRect(0, 0, cv.width, cv.height);
      }
      ctx.restore();

      const rem = Math.max(0, Math.ceil(TOTAL_TIME - this.elapsed));
      const tEl = U.$('esc-time');
      if (tEl) tEl.textContent = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(rem % 60).padStart(2, '0')}`;
    }

    async finish(win) {
      if (this.ended) return;
      this.ended = true;
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      const shield = Math.round(this.shield);
      const raw = win ? Math.min(300, Math.round(this.score * 0.8 + shield)) : Math.min(140, Math.round(this.score * 0.5));
      const awarded = await window.arcade.award(this.key, raw);
      U.snd(win ? 'complete' : 'incorrect');
      const lessons = [...new Set(this.mistakes)].slice(0, 5);
      if (!lessons.length) {
        lessons.push('¡Reflejos impecables! Distinguiste las amenazas de las operaciones oficiales de Corporación Suiche 7B.');
      }
      const root = window.arcade.root(this.key);
      root.innerHTML = window.arcade.headerHTML('🛡️ Escudo de Red 3D — Resultado') + window.arcade.resultHTML({
        emoji: win ? (shield >= 80 ? '🏆' : '🛡️') : '💥',
        title: win ? '¡Red Interbancaria Protegida!' : 'El Núcleo sufrió demasiados impactos',
        subtitle: win ? `Completaste las 3 oleadas defendiendo a Corporación Suiche 7B con ${shield}% de escudo.` : 'Algunas amenazas lograron pasar. ¡Inténtalo de nuevo y mejora tu racha!',
        stats: [
          ['Escudo final', `${shield}%`],
          ['Amenazas bloqueadas', this.blocked],
          ['Operaciones legítimas', this.legitPassed],
          ['Mejor racha', this.bestStreak]
        ],
        lessons,
        awarded,
        win,
        retryJs: 'arcade.games.arcade_jornada.open()'
      });
    }
  }

  window.arcade.register('arcade_jornada', new EscudoRedGame());
})();
