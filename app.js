/**
 * Academia CiberSegura Corporación Suiche 7B - Core App Controller (v2.0 Segura)
 * Manejo del Estado Global (SPA), sincronización con API REST segura en PostgreSQL,
 * persistencia local resiliente y Sintetizador de Audio Web.
 */

class AppController {
  constructor() {
    this.apiBaseUrl = '/api/v1';
    this.isServerOnline = false;

    this.state = {
      user: {
        id: null,
        name: '',
        department: '',
        score: 0,
        completedModules: {
          phishing: false,
          pci: false,
          incident: false,
          password: false,
          usb: false
        },
        attempts: 0,
        correctAnswers: 0,
        totalQuestions: 0
      },
      audioEnabled: true,
      currentView: 'welcome'
    };

    this.audioCtx = null;
    this.leaderboardData = [
      { dept: 'Dirección Tecnología', correctPercent: 92, count: 12 },
      { dept: 'Gerencia Operaciones y Servicio al Cliente', correctPercent: 88, count: 18 },
      { dept: 'Oficial de Cumplimiento', correctPercent: 86, count: 6 },
      { dept: 'Dirección Finanzas', correctPercent: 81, count: 9 },
      { dept: 'Presidencia Ejecutiva', correctPercent: 78, count: 11 },
      { dept: 'Dirección Desarrollo Nuevos Negocios', correctPercent: 75, count: 24 },
      { dept: 'Gerencia Capital Humano', correctPercent: 72, count: 7 }
    ];
  }

  async init() {
    this.loadState();

    // Comprobar conexión con la API y cargar departamentos / leaderboard desde la BD
    await this.checkServerConnection();
    await this.fetchLeaderboardFromDB();

    // Si ya existe usuario registrado, saltar directamente al Dashboard
    if (this.state.user.name) {
      this.showMainLayout();
      if (this.state.user.isAdmin) {
        this.navigateTo('admin-dashboard');
        this.loadAdminDashboard();
      } else {
        this.navigateTo('dashboard');
      }
    } else {
      this.navigateTo('welcome');
    }

    this.renderLeaderboard();
  }

  // --- COMPROBACIÓN DE CONEXIÓN CON EL SERVIDOR Y BASE DE DATOS ---
  async checkServerConnection() {
    try {
      const res = await fetch('/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        this.isServerOnline = data.status === 'healthy' || data.database === 'connected';
        console.log(`🛡️ Conexión segura con API y PostgreSQL: ${this.isServerOnline ? 'Activa' : 'Parcial'}`);
      }
    } catch (e) {
      console.warn('⚡ Modo Offline / Sin conexión directa a la API. Usando almacenamiento local seguro.');
      this.isServerOnline = false;
    }
  }

  // --- NAVEGACIÓN SINGLE PAGE APPLICATION (SPA) ---
  navigateTo(viewId) {
    this.currentView = viewId;
    document.body.setAttribute('data-view', viewId);

    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // Mostrar sección seleccionada
    const activeSection = document.getElementById(`${viewId}-view`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Actualizar estado de enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const onclickAttr = link.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${viewId}'`)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Reproducir un sonido sutil de clic de interfaz
    this.playAudio('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- REGISTRO / AUTENTICACIÓN SEGURA ---
  async handleRegistration(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById('user-username');
    const passwordInput = document.getElementById('user-password');

    if (!usernameInput || !passwordInput) return;

    const rawUsername = usernameInput.value.trim();
    const rawPassword = passwordInput.value;

    if (!rawUsername || !rawPassword) {
      this.showModalAlert({
        title: 'Campos Requeridos',
        message: 'Por favor ingresa tu usuario de dominio y contraseña corporativa.',
        type: 'warning'
      });
      return;
    }

    // Intentar sincronizar con la Base de Datos vía API REST
    try {
      // Mostrar estado de carga temporal
      const submitBtn = document.querySelector('#register-form button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Conectando con Active Directory...';
      submitBtn.disabled = true;

      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: rawUsername,
          password: rawPassword
        })
      });

      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        this.state.user.id = result.data.id;
        this.state.user.name = result.data.name; 
        this.state.user.department = result.data.department; 
        this.state.user.score = result.data.score || 0;
        this.state.user.correctAnswers = result.data.correctAnswers || 0;
        this.state.user.totalQuestions = result.data.totalQuestions || 0;
        
        // Atributos de administrador
        if (result.data.isAdmin) {
          this.state.user.isAdmin = true;
          this.state.user.token = result.data.token;
        }

        if (result.data.completedModules) {
          this.state.user.completedModules = {
            ...this.state.user.completedModules,
            ...result.data.completedModules
          };
        }
      } else {
        this.showModalAlert({
          title: 'Error de Autenticación',
          message: result.message || 'Usuario o contraseña incorrectos.',
          type: 'danger'
        });
        return;
      }
    } catch (err) {
      this.showModalAlert({
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor corporativo.',
        type: 'danger'
      });
      return;
    }

    this.saveState();
    this.playAudio('success');
    this.showMainLayout();
    this.updateUI();
    
    try {
      await this.fetchLeaderboardFromDB();
      this.renderLeaderboard();
    } catch (e) {
      console.warn("No se pudo cargar el leaderboard");
    }
    
    if (this.state.user.isAdmin) {
      this.navigateTo('admin-dashboard');
      this.loadAdminDashboard();
    } else {
      this.navigateTo('dashboard');
    }
  }

  // --- CIERRE DE SESIÓN ---
  logout() {
    localStorage.removeItem('s7b_cybershield_state');
    location.reload();
  }

  // --- CARGA DEL DASHBOARD ADMIN ---
  async loadAdminDashboard() {
    if (!this.state.user.isAdmin) return;

    try {
      const summaryRes = await fetch(`${this.apiBaseUrl}/stats/summary`, {
        headers: { 'Authorization': `Bearer ${this.state.user.token}` }
      });
      const summaryData = await summaryRes.json();
      
      if (summaryData.success) {
        document.getElementById('admin-total-users').innerText = summaryData.data.totalUsers;
        document.getElementById('admin-total-modules').innerText = summaryData.data.totalModulesCompleted;
      }

      const usersRes = await fetch(`${this.apiBaseUrl}/stats/users`, {
        headers: { 'Authorization': `Bearer ${this.state.user.token}` }
      });
      const usersData = await usersRes.json();

      if (usersData.success) {
        const tbody = document.getElementById('admin-users-table');
        tbody.innerHTML = '';
        usersData.data.forEach(u => {
          const row = document.createElement('tr');
          row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
          const lastActivityDate = new Date(u.last_activity || u.created_at).toLocaleString('es-VE');
          
          row.innerHTML = `
            <td style="padding:1rem;">${u.full_name}</td>
            <td style="padding:1rem; color:var(--text-muted);">${u.department || 'Área General'}</td>
            <td style="padding:1rem; color:var(--accent-cyan); font-weight:bold;">${u.total_score}</td>
            <td style="padding:1rem;">${u.modules_completed} / 5</td>
            <td style="padding:1rem; font-size:0.8rem;">${lastActivityDate}</td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (e) {
      console.error('Error al cargar panel de auditoría:', e);
    }
  }

  showMainLayout() {
    const mainNav = document.getElementById('main-nav');
    const userWidget = document.getElementById('user-widget');
    const logoutBtn = document.getElementById('logout-btn');
    if (mainNav) mainNav.style.display = 'flex';
    if (userWidget) userWidget.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'block';
  }

  // --- MANEJO DE ESTADO LOCAL ---
  saveState() {
    try {
      localStorage.setItem('s7b_cybershield_state', JSON.stringify(this.state));
    } catch (e) {
      console.error('Error guardando en almacenamiento local:', e);
    }
  }

  loadState() {
    const saved = localStorage.getItem('s7b_cybershield_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.name) {
          this.state = {
            ...this.state,
            ...parsed,
            user: { ...this.state.user, ...parsed.user }
          };
        }
      } catch (e) {
        console.error('Error cargando el progreso guardado:', e);
      }
    }
  }

  async resetProgress() {
    const confirmed = await this.showModalConfirm({
      title: '🚨 ¿Reiniciar Todo el Progreso?',
      message: 'Esta acción borrará todas tus puntuaciones, insignias y módulos completados de la base de datos de La Corporación Suiche 7B de forma permanente. ¿Deseas continuar?',
      type: 'danger'
    });

    if (confirmed) {
      // Reiniciar en base de datos si tenemos ID
      if (this.state.user.id) {
        try {
          await fetch(`${this.apiBaseUrl}/progress/reset/${this.state.user.id}`, {
            method: 'POST'
          });
        } catch (e) {
          console.warn('Error reiniciando en servidor:', e);
        }
      }

      localStorage.removeItem('s7b_cybershield_state');
      this.state.user = {
        id: null,
        name: '',
        department: '',
        score: 0,
        completedModules: {
          phishing: false,
          pci: false,
          incident: false,
          password: false,
          usb: false
        },
        attempts: 0,
        correctAnswers: 0,
        totalQuestions: 0
      };

      const mainNav = document.getElementById('main-nav');
      const userWidget = document.getElementById('user-widget');
      if (mainNav) mainNav.style.display = 'none';
      if (userWidget) userWidget.style.display = 'none';

      const nameInput = document.getElementById('user-name');
      const deptInput = document.getElementById('user-dept');
      if (nameInput) nameInput.value = '';
      if (deptInput) deptInput.value = '';

      await this.fetchLeaderboardFromDB();
      this.navigateTo('welcome');
    }
  }

  // --- ACTUALIZACIONES DE INTERFAZ DE USUARIO ---
  updateUI() {
    if (!this.state.user.name) return;

    // Nombre en Dashboard
    const nameEl = document.getElementById('dash-user-name');
    if (nameEl) nameEl.textContent = this.state.user.name;

    // Estado en el Widget de la cabecera
    const widgetScore = document.getElementById('widget-score');
    if (widgetScore) widgetScore.textContent = this.state.user.score;
    const level = this.getSecurityLevel(this.state.user.score);
    const widgetLevel = document.getElementById('widget-level');
    if (widgetLevel) widgetLevel.textContent = level;

    // Estado en el Sidebar
    const statsScore = document.getElementById('stats-score');
    if (statsScore) statsScore.textContent = `${this.state.user.score} PTS`;
    const statsLevel = document.getElementById('stats-level-text');
    if (statsLevel) statsLevel.textContent = level;

    // Calcular completados
    let completedCount = 0;
    if (this.state.user.completedModules.phishing) completedCount++;
    if (this.state.user.completedModules.pci) completedCount++;
    if (this.state.user.completedModules.incident) completedCount++;
    if (this.state.user.completedModules.password) completedCount++;
    if (this.state.user.completedModules.usb) completedCount++;

    const statsModules = document.getElementById('stats-modules');
    if (statsModules) statsModules.textContent = `${completedCount} / 5`;

    // Porcentaje de acierto
    const accuracy = this.state.user.totalQuestions > 0
      ? Math.round((this.state.user.correctAnswers / this.state.user.totalQuestions) * 100)
      : 0;
    const statsAccuracy = document.getElementById('stats-accuracy');
    if (statsAccuracy) statsAccuracy.textContent = `${accuracy}%`;

    // Actualizar badges de estado de tarjetas del dashboard
    this.updateStatusBadge('phishing', this.state.user.completedModules.phishing);
    this.updateStatusBadge('pci', this.state.user.completedModules.pci);
    this.updateStatusBadge('incident', this.state.user.completedModules.incident);
    this.updateStatusBadge('password', this.state.user.completedModules.password);
    this.updateStatusBadge('usb', this.state.user.completedModules.usb);

    // Si completó todos los módulos, habilitar botón de certificado
    const certGrant = document.getElementById('cert-grant-container');
    if (certGrant) {
      if (completedCount === 5) {
        certGrant.style.display = 'block';
      } else {
        certGrant.style.display = 'none';
      }
    }
  }

  updateStatusBadge(gameId, isCompleted) {
    const badge = document.getElementById(`status-${gameId}`);
    if (badge) {
      if (isCompleted) {
        badge.textContent = 'Completado';
        badge.className = 'game-status-badge status-completed';
      } else {
        badge.textContent = 'Pendiente';
        badge.className = 'game-status-badge status-pending';
      }
    }
  }

  getSecurityLevel(score) {
    if (score >= 450) return 'Centinela de La Corporación Suiche 7B (Leyenda)';
    if (score >= 350) return 'Guardián de Datos Élite';
    if (score >= 220) return 'Analista de Defensa';
    if (score >= 100) return 'Operador Alerta';
    return 'Novicio de Seguridad';
  }

  // Agregar puntuación al usuario y sincronizar con base de datos
  async addPoints(points, isCorrectAnswer = true, moduleKey = null) {
    this.state.user.score += points;
    this.state.user.totalQuestions++;
    if (isCorrectAnswer) {
      this.state.user.correctAnswers++;
    }
    this.saveState();
    this.updateUI();

    // Sincronizar con backend si hay sesión
    if (this.state.user.id && moduleKey) {
      try {
        await fetch(`${this.apiBaseUrl}/progress/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.state.user.id,
            moduleKey: moduleKey,
            scoreEarned: points,
            isCompleted: this.state.user.completedModules[moduleKey] || false,
            isCorrectAnswer: isCorrectAnswer
          })
        });
      } catch (err) {
        console.warn('Error sincronizando puntos con backend:', err);
      }
    }
  }

  async markModuleCompleted(moduleId, scoreBonus = 0) {
    this.state.user.completedModules[moduleId] = true;
    if (scoreBonus > 0) {
      this.state.user.score += scoreBonus;
    }
    this.saveState();
    this.updateUI();

    // Sincronizar módulo completado en PostgreSQL
    if (this.state.user.id) {
      try {
        await fetch(`${this.apiBaseUrl}/progress/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.state.user.id,
            moduleKey: moduleId,
            scoreEarned: scoreBonus,
            isCompleted: true,
            isCorrectAnswer: true
          })
        });
      } catch (err) {
        console.warn('Error sincronizando módulo completado con PostgreSQL:', err);
      }
    }

    await this.fetchLeaderboardFromDB();
    this.renderLeaderboard();
  }

  // --- LÓGICA DE COMPETENCIA DEPARTAMENTAL (LEADERBOARD) ---
  async fetchLeaderboardFromDB() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/stats/leaderboard`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.leaderboardData = json.data;
          this.renderLeaderboard();
        }
      }
    } catch (e) {
      console.warn('Usando ranking local:', e);
    }
  }

  renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    let leaderboard = [...this.leaderboardData];

    // Marcar el departamento del usuario
    if (this.state.user.name && this.state.user.department) {
      const userDeptName = this.state.user.department.toLowerCase();
      leaderboard.forEach(d => {
        if (d.dept && d.dept.toLowerCase().includes(userDeptName.substring(0, 5))) {
          d.isUserDept = true;
        }
      });
    }

    // Ordenar por porcentaje de acierto descendente
    leaderboard.sort((a, b) => (b.correctPercent || 0) - (a.correctPercent || 0));

    // Renderizar filas de forma segura
    container.innerHTML = '';
    leaderboard.forEach((item, index) => {
      const rank = index + 1;
      let rankClass = rank <= 3 ? `rank-${rank}` : '';
      const isHighlight = item.isUserDept ? 'highlight' : '';

      const itemDiv = document.createElement('div');
      itemDiv.className = `leaderboard-item ${isHighlight}`;

      const rankBadge = document.createElement('span');
      rankBadge.className = `rank-badge ${rankClass}`;
      rankBadge.textContent = rank;

      const deptNameSpan = document.createElement('span');
      deptNameSpan.className = 'department-name';
      deptNameSpan.textContent = `${item.dept} `;

      if (item.isUserDept) {
        const tag = document.createElement('small');
        tag.style.color = 'var(--accent-cyan)';
        tag.style.fontWeight = '700';
        tag.textContent = '(Tu Área)';
        deptNameSpan.appendChild(tag);
      }

      const leftDiv = document.createElement('div');
      leftDiv.className = 'leaderboard-rank-name';
      leftDiv.appendChild(rankBadge);
      leftDiv.appendChild(deptNameSpan);

      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'leaderboard-score';
      scoreSpan.textContent = `${item.correctPercent || 0}%`;

      itemDiv.appendChild(leftDiv);
      itemDiv.appendChild(scoreSpan);
      container.appendChild(itemDiv);
    });
  }

  // --- SINTETIZADOR DE AUDIO DIGITAL (WEB AUDIO API) ---
  toggleAudio() {
    this.state.audioEnabled = !this.state.audioEnabled;
    const btn = document.getElementById('audio-toggle-btn');
    if (btn) {
      btn.textContent = this.state.audioEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
    }
    this.saveState();
  }

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playAudio(type) {
    if (!this.state.audioEnabled) return;

    try {
      this.initAudio();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      switch (type) {
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
        case 'correct': {
          const frequencies = [523.25, 659.25, 783.99, 1046.50];
          frequencies.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const playTime = now + (idx * 0.08);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, playTime);
            gain.gain.setValueAtTime(0.0, playTime);
            gain.gain.linearRampToValueAtTime(0.08, playTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(playTime);
            osc.stop(playTime + 0.35);
          });
          break;
        }
        case 'incorrect': {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(180, now);
          osc1.frequency.linearRampToValueAtTime(90, now + 0.35);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(185, now);
          osc2.frequency.linearRampToValueAtTime(92, now + 0.35);
          gain.gain.setValueAtTime(0.0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.4);
          osc2.stop(now + 0.4);
          break;
        }
        case 'complete': {
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const time = now + (idx * 0.06);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.06, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.45);
          });
          break;
        }
        case 'incident_alert': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(1000, now + 0.15);
          osc.frequency.linearRampToValueAtTime(600, now + 0.3);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.linearRampToValueAtTime(0.06, now + 0.2);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }
      }
    } catch (e) {
      console.warn('Web Audio no inicializado por el navegador.', e);
    }
  }

  // --- MODAL DE CERTIFICADOS ---
  showCertificate() {
    this.playAudio('complete');

    const recipient = document.getElementById('cert-recipient');
    if (recipient) recipient.textContent = this.state.user.name;

    const hash = btoa(encodeURIComponent(this.state.user.name + (this.state.user.score || 0))).substring(0, 8).toUpperCase();
    const valCode = document.getElementById('cert-val-code');
    if (valCode) valCode.textContent = `S7B-${hash}-SEC`;

    // Fecha dinámica en español
    const dateDisplay = document.getElementById('cert-date-display');
    if (dateDisplay) {
      const now = new Date();
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      dateDisplay.textContent = `${meses[now.getMonth()]} de ${now.getFullYear()}`;
    }

    const modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.add('active');
  }

  hideCertificate() {
    this.playAudio('click');
    const modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.remove('active');
  }

  // --- INICIALIZACIÓN DE JUEGOS ---
  startPhishingGame() {
    this.navigateTo('phishing');
    if (window.games && games.phishing) games.phishing.init();
  }

  startPciGame() {
    this.navigateTo('pci');
    if (window.games && games.pci) games.pci.init();
  }

  startIncidentGame() {
    this.navigateTo('incident');
    if (window.games && games.incident) games.incident.init();
  }

  startPasswordGame() {
    this.navigateTo('password');
    if (window.games && games.password) games.password.init();
  }

  startUsbGame() {
    this.navigateTo('usb');
    if (window.games && games.usb) games.usb.init();
  }

  // --- SISTEMA DE DIÁLOGOS DE SEGURIDAD PERSONALIZADOS ---
  showModalAlert(options) {
    const { title = 'Notificación de Seguridad', message = '', type = 'info', callback = null } = options;

    return new Promise((resolve) => {
      const modal = document.getElementById('custom-dialog-modal');
      if (!modal) {
        alert(message);
        return resolve(true);
      }
      const dialogContent = modal.querySelector('.custom-dialog-content');
      const titleEl = document.getElementById('dialog-title');
      const msgEl = document.getElementById('dialog-message');
      const okBtn = document.getElementById('dialog-ok-btn');
      const cancelBtn = document.getElementById('dialog-cancel-btn');
      const iconEl = document.getElementById('dialog-icon');

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.innerHTML = message;

      if (dialogContent) {
        dialogContent.className = 'modal-content custom-dialog-content';
        dialogContent.classList.add(`dialog-${type}`);
      }

      let icon = '⚠️';
      if (type === 'success') {
        icon = '🛡️';
        this.playAudio('correct');
      } else if (type === 'danger') {
        icon = '🚨';
        this.playAudio('incorrect');
      } else if (type === 'warning') {
        icon = '⚠️';
        this.playAudio('incident_alert');
      } else {
        icon = 'ℹ️';
        this.playAudio('click');
      }
      if (iconEl) iconEl.textContent = icon;

      if (cancelBtn) cancelBtn.style.display = 'none';
      modal.classList.add('active');

      const handleOk = () => {
        this.playAudio('click');
        modal.classList.remove('active');
        if (okBtn) okBtn.removeEventListener('click', handleOk);
        if (callback) callback();
        resolve(true);
      };

      if (okBtn) okBtn.addEventListener('click', handleOk);
    });
  }

  showModalConfirm(options) {
    const { title = 'Confirmar Operación', message = '', type = 'warning' } = options;

    return new Promise((resolve) => {
      const modal = document.getElementById('custom-dialog-modal');
      if (!modal) {
        return resolve(confirm(message));
      }
      const dialogContent = modal.querySelector('.custom-dialog-content');
      const titleEl = document.getElementById('dialog-title');
      const msgEl = document.getElementById('dialog-message');
      const okBtn = document.getElementById('dialog-ok-btn');
      const cancelBtn = document.getElementById('dialog-cancel-btn');
      const iconEl = document.getElementById('dialog-icon');

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.innerHTML = message;

      if (dialogContent) {
        dialogContent.className = 'modal-content custom-dialog-content';
        dialogContent.classList.add(`dialog-${type}`);
      }

      let icon = '❓';
      if (type === 'danger') icon = '🚨';
      else if (type === 'warning') icon = '⚠️';
      if (iconEl) iconEl.textContent = icon;

      if (cancelBtn) cancelBtn.style.display = 'block';

      this.playAudio('incident_alert');
      modal.classList.add('active');

      const cleanup = () => {
        modal.classList.remove('active');
        if (okBtn) okBtn.removeEventListener('click', handleConfirm);
        if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
      };

      const handleConfirm = () => {
        this.playAudio('click');
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        this.playAudio('click');
        cleanup();
        resolve(false);
      };

      if (okBtn) okBtn.addEventListener('click', handleConfirm);
      if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    });
  }

  // --- EXPORTAR REPORTES (CSV/PDF) ---
  exportTableToCSV() {
    const table = document.querySelector("#admin-dashboard-view table");
    if (!table) return;
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para Excel
    const rows = table.querySelectorAll("tr");
    
    rows.forEach(row => {
      let rowData = [];
      const cols = row.querySelectorAll("th, td");
      cols.forEach(col => {
        let text = col.innerText.replace(/"/g, '""'); // Escapar comillas
        rowData.push(`"${text}"`);
      });
      csvContent += rowData.join(";") + "\r\n"; // Punto y coma para separar (mejor en español)
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "auditoria_suiche7b_" + new Date().toISOString().split('T')[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportTableToPDF() {
    if (typeof html2pdf === 'undefined') {
      this.showModalAlert({ title: 'Error', message: 'Librería PDF no cargada.', type: 'danger' });
      return;
    }
    const element = document.createElement('div');
    element.innerHTML = `
      <h2 style="font-family: Arial, sans-serif; color: #2e3a59; text-align: center; margin-bottom: 20px;">
        Auditoría de Entrenamiento - Corporación Suiche 7B
      </h2>
      <p style="text-align:right; font-family: Arial; font-size: 12px; color: #666;">Fecha: ${new Date().toLocaleDateString('es-VE')}</p>
    `;
    const table = document.querySelector("#admin-dashboard-view table").cloneNode(true);
    
    // Aplicar estilos básicos para el PDF
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '12px';
    
    const cells = table.querySelectorAll('th, td');
    cells.forEach(cell => {
      cell.style.border = '1px solid #ccc';
      cell.style.padding = '8px';
      cell.style.textAlign = 'left';
      cell.style.color = '#333';
    });
    
    const headers = table.querySelectorAll('th');
    headers.forEach(th => {
      th.style.backgroundColor = '#f4f4f4';
      th.style.fontWeight = 'bold';
    });

    element.appendChild(table);

    const opt = {
      margin:       0.5,
      filename:     'auditoria_suiche7b.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    // Agregar un mensaje de carga
    const originalBtn = document.querySelector('button[onclick="app.exportTableToPDF()"]');
    if(originalBtn) originalBtn.innerText = 'Generando...';

    html2pdf().set(opt).from(element).save().then(() => {
      if(originalBtn) originalBtn.innerText = '📄 PDF';
    });
  }
}

// Declarar variable global de instancia
let app = new AppController();
window.app = app;

window.addEventListener('DOMContentLoaded', () => {
  app.init();
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    app.handleRegistration(e);
  });
});

