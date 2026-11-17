/**
 * Academia CiberSegura Suiche 7B - ARCADE CORE
 * Utilidades compartidas + Mini3D (motor 3D por software sobre Canvas 2D, sin GPU ni librerías externas)
 * + registro de juegos Arcade + otorgamiento de puntos (con control Anti-Farming en servidor).
 */
(function () {
  'use strict';

  const U = {
    $: (id) => document.getElementById(id),
    rnd: (a, b) => a + Math.random() * (b - a),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    shuffle(arr) {
      const r = [...arr];
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [r[i], r[j]] = [r[j], r[i]];
      }
      return r;
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    snd(type) {
      try { if (window.app && window.app.playAudio) window.app.playAudio(type); } catch (e) { /* audio opcional */ }
    },
    fmtClock(minutes) {
      const m = Math.floor(minutes);
      const h = 8 + Math.floor(m / 60);
      const mm = String(m % 60).padStart(2, '0');
      return `${String(h).padStart(2, '0')}:${mm}`;
    },
    LETTERS: ['A', 'B', 'C', 'D', 'E']
  };

  // ---------------------------------------------------------------------------
  // MINI3D: motor 3D de polígonos con proyección isométrica/perspectiva, sombreado,
  // ordenamiento por capas/profundidad y detección de clics por polígono.
  // Ejes: x derecha, y arriba, z hacia el observador.
  // ---------------------------------------------------------------------------
  class Mini3D {
    constructor(canvas, opt = {}) {
      this.canvas = canvas;
      this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      this.yaw = opt.yaw !== undefined ? opt.yaw : Math.PI / 4;
      this.pitch = opt.pitch !== undefined ? opt.pitch : 0.62;
      this.scale = opt.scale || 40;
      this.persp = opt.persp || 0;
      this.cx = opt.cx !== undefined ? opt.cx : 0.5;
      this.cy = opt.cy !== undefined ? opt.cy : 0.58;
      this.light = Mini3D.norm([0.45, 0.85, 0.55]);
      this.faces = [];
      this.sprites = [];
      this.hits = [];
    }

    static norm(v) {
      const l = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / l, v[1] / l, v[2] / l];
    }

    static mix(c, f) {
      return [Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)];
    }

    static hex(h) {
      const n = parseInt(h.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    clear() {
      this.faces = [];
      this.sprites = [];
    }

    _rot(p) {
      const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
      const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const x1 = p[0] * cy - p[2] * sy;
      const z1 = p[0] * sy + p[2] * cy;
      return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
    }

    project(p) {
      const r = this._rot(p);
      const w = this.canvas.width, h = this.canvas.height;
      const k = this.persp ? this.persp / (this.persp - r[2]) : 1;
      return { x: w * this.cx + r[0] * this.scale * k, y: h * this.cy - r[1] * this.scale * k, z: r[2] };
    }

    // Agrega una cara. verts: arreglo de [x,y,z]; n: normal en mundo.
    addFace(verts, n, color, id, opt = {}) {
      this.faces.push({ verts, n, color, id: id || null, layer: opt.layer || 0, emissive: opt.emissive || 0, alpha: opt.alpha === undefined ? 1 : opt.alpha, stroke: opt.stroke !== false });
    }

    // Caja alineada a ejes: centro (x,z), base y, tamaño (w,h,d)
    addBox(x, y, z, w, h, d, color, id, opt = {}) {
      const x0 = x - w / 2, x1 = x + w / 2, y0 = y, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2;
      const xf = opt.xf || ((v) => v);
      const nf = opt.nf || ((n) => n);
      const c = typeof color === 'string' ? Mini3D.hex(color) : color;
      const F = (vs, n) => this.addFace(vs.map(xf), nf(n), c, id, opt);
      F([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0]);
      F([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]);
      F([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0]);
      F([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]);
      F([[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1]);
    }

    // Prisma extruido: polígono 2D en plano XY, entre z0 y z1 (cara frontal hacia +z)
    addExtrude(poly, z0, z1, color, id, opt = {}) {
      const xf = opt.xf || ((v) => v);
      const nf = opt.nf || ((n) => n);
      const c = typeof color === 'string' ? Mini3D.hex(color) : color;
      this.addFace(poly.map((p) => xf([p[0], p[1], z1])), nf([0, 0, 1]), c, id, opt);
      if (opt.back !== false) this.addFace(poly.slice().reverse().map((p) => xf([p[0], p[1], z0])), nf([0, 0, -1]), Mini3D.mix(c, 0.7), id, opt);
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        const ex = b[1] - a[1], ey = -(b[0] - a[0]);
        const nn = Mini3D.norm([ex, ey, 0]);
        this.addFace([xf([a[0], a[1], z0]), xf([b[0], b[1], z0]), xf([b[0], b[1], z1]), xf([a[0], a[1], z1])], nf(nn), c, id, opt);
      }
    }

    static ngon(r, sides, rot = 0, cx = 0, cy = 0) {
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const a = rot + (i / sides) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return pts;
    }

    // Marcador flotante 2D (se dibuja encima de todo y es clicable)
    addSprite(x, y, z, o) {
      this.sprites.push(Object.assign({ pos: [x, y, z] }, o));
    }

    render() {
      const ctx = this.ctx;
      if (!ctx) return;
      const list = [];
      for (const f of this.faces) {
        const rn = this._rot(f.n);
        if (rn[2] <= 0.0001 && f.alpha === 1) continue; // cara trasera
        const pts = f.verts.map((v) => this.project(v));
        const depth = pts.reduce((s, p) => s + p.z, 0) / pts.length;
        list.push({ f, pts, depth });
      }
      list.sort((a, b) => (a.f.layer - b.f.layer) || (a.depth - b.depth));
      this.hits = [];
      for (const it of list) {
        const f = it.f;
        const lit = Math.max(0, f.n[0] * this.light[0] + f.n[1] * this.light[1] + f.n[2] * this.light[2]);
        const b = 0.5 + 0.55 * lit + f.emissive;
        const col = Mini3D.mix(f.color, b);
        ctx.beginPath();
        ctx.moveTo(it.pts[0].x, it.pts[0].y);
        for (let i = 1; i < it.pts.length; i++) ctx.lineTo(it.pts[i].x, it.pts[i].y);
        ctx.closePath();
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
        ctx.fill();
        if (f.stroke) {
          ctx.strokeStyle = 'rgba(0,0,0,0.28)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (f.id) this.hits.push({ id: f.id, poly: it.pts });
      }
      // Sprites
      for (const s of this.sprites) {
        const p = this.project(s.pos);
        const r = s.r || 15;
        const pulse = s.pulse ? 1 + 0.15 * Math.sin(s.pulse) : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = s.bg || 'rgba(239,68,68,0.9)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = s.border || '#fff';
        ctx.stroke();
        if (s.ring !== undefined) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * pulse + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * U.clamp(s.ring, 0, 1));
          ctx.strokeStyle = s.ringColor || '#fbba0a';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.fillStyle = s.fg || '#fff';
        ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.text || '!', p.x, p.y + 1);
        if (s.label) {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = 'rgba(0,0,0,0.75)';
          ctx.lineWidth = 3;
          ctx.strokeText(s.label, p.x, p.y + r + 13);
          ctx.fillText(s.label, p.x, p.y + r + 13);
        }
        if (s.id) this.hits.push({ id: s.id, circle: { x: p.x, y: p.y, r: r + 8 }, top: true });
      }
    }

    // Devuelve el id de lo clicado (coordenadas en píxeles del canvas)
    pick(px, py) {
      for (let i = this.hits.length - 1; i >= 0; i--) {
        const h = this.hits[i];
        if (h.circle && Math.hypot(px - h.circle.x, py - h.circle.y) <= h.circle.r) return h.id;
      }
      for (let i = this.hits.length - 1; i >= 0; i--) {
        const h = this.hits[i];
        if (h.poly && Mini3D.inPoly(px, py, h.poly)) return h.id;
      }
      return null;
    }

    static inPoly(x, y, poly) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    // Convierte evento de puntero a coordenadas internas del canvas
    static canvasPoint(canvas, ev) {
      const r = canvas.getBoundingClientRect();
      const sx = canvas.width / (r.width || canvas.width);
      const sy = canvas.height / (r.height || canvas.height);
      return { x: (ev.clientX - r.left) * sx, y: (ev.clientY - r.top) * sy };
    }
  }

  // ---------------------------------------------------------------------------
  // REGISTRO DE JUEGOS ARCADE + PUNTOS
  // ---------------------------------------------------------------------------
  const CAPS = { arcade_jornada: 300, arcade_bandeja: 200, arcade_cartas: 200, arcade_boveda: 250 };
  const BEST_KEY = 's7b_arcade_best_v1';

  const arcade = {
    U,
    Mini3D,
    CAPS,
    games: {},
    active: null,

    register(key, game) {
      this.games[key] = game;
      game.key = key;
    },

    open(key) {
      Object.keys(this.games).forEach((k) => { if (k !== key) this.games[k].stop && this.games[k].stop(); });
      this.active = key;
      const g = this.games[key];
      if (g) g.open();
    },

    onNavigate(viewId) {
      Object.keys(this.games).forEach((k) => {
        if (k !== viewId && this.games[k].stop) this.games[k].stop();
      });
      if (!this.games[viewId]) this.active = null;
    },

    root(key) {
      return document.getElementById(`arcade-root-${key}`);
    },

    getBest(key) {
      try { return (JSON.parse(localStorage.getItem(BEST_KEY) || '{}'))[key] || 0; } catch (e) { return 0; }
    },

    setBest(key, score) {
      try {
        const all = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
        if (score > (all[key] || 0)) {
          all[key] = score;
          localStorage.setItem(BEST_KEY, JSON.stringify(all));
        }
      } catch (e) { /* almacenamiento opcional */ }
    },

    // Otorga puntos solo la primera vez (Anti-Farming); las repeticiones son práctica libre.
    async award(key, rawPoints) {
      const points = Math.max(0, Math.min(CAPS[key] || 150, Math.round(rawPoints)));
      this.setBest(key, points);
      const a = window.app;
      if (!a || !a.state) return { points, first: false };
      const already = Boolean(a.state.user.completedModules[key]);
      if (already) return { points, first: false };
      await a.addPoints(points, true, key);
      await a.markModuleCompleted(key);
      return { points, first: true };
    },

    // Pantalla de resultados estándar
    resultHTML({ emoji, title, subtitle, stats, lessons, awarded, retryJs, win, extra }) {
      const statHtml = (stats || []).map((s) => `<div class="arc-stat"><span>${U.esc(s[0])}</span><strong>${U.esc(s[1])}</strong></div>`).join('');
      const lessonHtml = (lessons || []).length
        ? `<div class="arc-lessons"><h4>📘 Lo que debes recordar</h4><ul>${lessons.map((l) => `<li>${l}</li>`).join('')}</ul></div>` : '';
      const note = awarded
        ? (awarded.first ? `<div class="arc-award ok">🏅 +${awarded.points} puntos sumados a tu perfil</div>`
          : `<div class="arc-award">♻️ Práctica libre: obtuviste ${awarded.points} pts (los puntos solo se suman la primera vez)</div>`)
        : '';
      return `
        <div class="arc-result ${win ? 'win' : 'lose'}">
          <div class="arc-result-emoji">${emoji}</div>
          <h2>${U.esc(title)}</h2>
          <p>${U.esc(subtitle || '')}</p>
          <div class="arc-stats">${statHtml}</div>
          ${note}
          ${extra || ''}
          ${lessonHtml}
          <div class="arc-actions">
            <button class="btn btn-primary" onclick="${retryJs}">🔁 Jugar de nuevo</button>
            <button class="btn btn-secondary" onclick="app.navigateTo('dashboard')">← Volver al Panel</button>
          </div>
        </div>`;
    },

    headerHTML(title, extra) {
      return `
        <div class="arc-head">
          <button class="btn btn-secondary" onclick="app.navigateTo('dashboard')" style="padding:0.4rem 0.8rem; font-size:0.85rem;">← Volver al Panel</button>
          <div class="arc-title">${title}</div>
          <div class="arc-head-extra">${extra || ''}</div>
        </div>`;
    }
  };

  window.arcade = arcade;
})();
