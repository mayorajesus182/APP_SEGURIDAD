/**
 * Academia CiberSegura Suiche7B - Core App Controller
 * Manejo del Estado Global (SPA), persistencia en LocalStorage y Sintetizador de Audio Web.
 */

class AppController {
  constructor() {
    this.state = {
      user: {
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
      { dept: 'Tecnología y Desarrollo', correctPercent: 92, count: 12 },
      { dept: 'Operaciones y Canales', correctPercent: 88, count: 18 },
      { dept: 'Legal y Cumplimiento', correctPercent: 86, count: 6 },
      { dept: 'Finanzas y Contabilidad', correctPercent: 81, count: 9 },
      { dept: 'Administración', correctPercent: 78, count: 11 },
      { dept: 'Atención al Cliente', correctPercent: 75, count: 24 },
      { dept: 'Recursos Humanos', correctPercent: 72, count: 7 }
    ];
  }

  init() {
    this.loadState();
    
    // Si ya existe usuario registrado, saltar directamente al Dashboard
    if (this.state.user.name) {
      this.showMainLayout();
      this.navigateTo('dashboard');
    } else {
      this.navigateTo('welcome');
    }

    this.renderLeaderboard();
  }

  // --- NAVEGACIÓN SINGLE PAGE APPLICATION (SPA) ---
  navigateTo(viewId) {
    this.currentView = viewId;
    
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

  // --- REGISTRO / AUTENTICACIÓN SIMULADA ---
  handleRegistration(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('user-name');
    const deptInput = document.getElementById('user-dept');

    if (!nameInput.value || !deptInput.value) return;

    this.state.user.name = nameInput.value.trim();
    this.state.user.department = deptInput.value;
    this.state.user.score = 0;
    this.state.user.completedModules = {
      phishing: false,
      pci: false,
      incident: false,
      password: false,
      usb: false
    };
    this.state.user.attempts = 0;
    this.state.user.correctAnswers = 0;
    this.state.user.totalQuestions = 0;

    this.saveState();
    this.showMainLayout();
    this.updateUI();
    this.renderLeaderboard();
    this.navigateTo('dashboard');
    
    // Sonido de inicio triunfal
    this.playAudio('complete');
  }

  showMainLayout() {
    document.getElementById('main-nav').style.display = 'flex';
    document.getElementById('user-widget').style.display = 'flex';
  }

  // --- MANEJO DE ESTADO LOCAL ---
  saveState() {
    localStorage.setItem('s7b_cybershield_state', JSON.stringify(this.state));
  }

  loadState() {
    const saved = localStorage.getItem('s7b_cybershield_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.name) {
          this.state = parsed;
        }
      } catch (e) {
        console.error('Error cargando el progreso guardado:', e);
      }
    }
  }

  resetProgress() {
    this.showModalConfirm({
      title: '🚨 ¿Reiniciar Todo el Progreso?',
      message: 'Esta acción borrará todas tus puntuaciones, insignias y módulos completados de la red de Suiche7B de forma permanente. ¿Deseas continuar?',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        localStorage.removeItem('s7b_cybershield_state');
        this.state.user = {
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
        
        document.getElementById('main-nav').style.display = 'none';
        document.getElementById('user-widget').style.display = 'none';
        
        document.getElementById('user-name').value = '';
        document.getElementById('user-dept').value = '';
        
        this.navigateTo('welcome');
      }
    });
  }

  // --- ACTUALIZACIONES DE INTERFAZ DE USUARIO ---
  updateUI() {
    if (!this.state.user.name) return;

    // Nombre en Dashboard
    document.getElementById('dash-user-name').textContent = this.state.user.name;

    // Estado en el Widget de la cabecera
    document.getElementById('widget-score').textContent = this.state.user.score;
    const level = this.getSecurityLevel(this.state.user.score);
    document.getElementById('widget-level').textContent = level;

    // Estado en el Sidebar
    document.getElementById('stats-score').textContent = `${this.state.user.score} PTS`;
    document.getElementById('stats-level-text').textContent = level;

    // Calcular completados
    let completedCount = 0;
    if (this.state.user.completedModules.phishing) completedCount++;
    if (this.state.user.completedModules.pci) completedCount++;
    if (this.state.user.completedModules.incident) completedCount++;
    if (this.state.user.completedModules.password) completedCount++;
    if (this.state.user.completedModules.usb) completedCount++;
    document.getElementById('stats-modules').textContent = `${completedCount} / 5`;

    // Porcentaje de acierto
    const accuracy = this.state.user.totalQuestions > 0 
      ? Math.round((this.state.user.correctAnswers / this.state.user.totalQuestions) * 100)
      : 0;
    document.getElementById('stats-accuracy').textContent = `${accuracy}%`;

    // Actualizar badges de estado de tarjetas del dashboard
    this.updateStatusBadge('phishing', this.state.user.completedModules.phishing);
    this.updateStatusBadge('pci', this.state.user.completedModules.pci);
    this.updateStatusBadge('incident', this.state.user.completedModules.incident);
    this.updateStatusBadge('password', this.state.user.completedModules.password);
    this.updateStatusBadge('usb', this.state.user.completedModules.usb);

    // Si completó todos los módulos, habilitar botón de certificado
    if (completedCount === 5) {
      document.getElementById('cert-grant-container').style.display = 'block';
    } else {
      document.getElementById('cert-grant-container').style.display = 'none';
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
    if (score >= 450) return 'Centinela de Suiche7B (Leyenda)';
    if (score >= 350) return 'Guardián de Datos Élite';
    if (score >= 220) return 'Analista de Defensa';
    if (score >= 100) return 'Operador Alerta';
    return 'Novicio de Seguridad';
  }

  // Agregar puntuación al usuario
  addPoints(points, isCorrectAnswer = true) {
    this.state.user.score += points;
    this.state.user.totalQuestions++;
    if (isCorrectAnswer) {
      this.state.user.correctAnswers++;
    }
    this.saveState();
    this.updateUI();
  }

  markModuleCompleted(moduleId) {
    this.state.user.completedModules[moduleId] = true;
    this.saveState();
    this.updateUI();
    this.renderLeaderboard(); // Recalcular con el progreso del departamento del usuario
  }

  // --- LÓGICA DE COMPETENCIA DEPARTAMENTAL (LEADERBOARD) ---
  renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    // Copiar y calcular datos del ranking
    let leaderboard = [...this.leaderboardData];

    // Si el usuario ya está registrado, integrar su desempeño en el promedio de su área
    if (this.state.user.name && this.state.user.department) {
      const userDeptName = this.state.user.department;
      const deptIndex = leaderboard.findIndex(d => d.dept.toLowerCase().includes(userDeptName.substring(0, 5).toLowerCase()));
      
      if (deptIndex !== -1) {
        // Simular que el desempeño del usuario impacta el promedio del departamento
        const dept = leaderboard[deptIndex];
        const accuracy = this.state.user.totalQuestions > 0 
          ? (this.state.user.correctAnswers / this.state.user.totalQuestions) * 100 
          : 50; // Inicial
        
        // Promediar el desempeño histórico con el del usuario actual
        dept.correctPercent = Math.round((dept.correctPercent * dept.count + accuracy) / (dept.count + 1));
        dept.count += 1;
        dept.isUserDept = true;
      }
    }

    // Ordenar por porcentaje de acierto descendente
    leaderboard.sort((a, b) => b.correctPercent - a.correctPercent);

    // Renderizar filas
    container.innerHTML = '';
    leaderboard.forEach((item, index) => {
      const rank = index + 1;
      let rankClass = `rank-${rank}`;
      if (rank > 3) rankClass = '';

      const isHighlight = item.isUserDept ? 'highlight' : '';

      container.innerHTML += `
        <div class="leaderboard-item ${isHighlight}">
          <div class="leaderboard-rank-name">
            <span class="rank-badge ${rankClass}">${rank}</span>
            <span class="department-name">${item.dept} ${item.isUserDept ? '<small style="color:var(--accent-cyan); font-weight:700;">(Tu Área)</small>' : ''}</span>
          </div>
          <span class="leaderboard-score">${item.correctPercent}%</span>
        </div>
      `;
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
          // Un clic corto y futurista de alta frecuencia
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
          // Tono ascendente agradable en acordes (Premio)
          const frequencies = [523.25, 659.25, 783.99, 1046.50]; // Do - Mi - Sol - Do
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
          // Sonido de advertencia o error descendente (Buzzer)
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
          // Fanfarria triunfal ascendente
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
          // Alerta cíclica de sirena corta
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
      console.warn('Web Audio no inicializado completamente por políticas del navegador.', e);
    }
  }

  // --- MODAL DE CERTIFICADOS ---
  showCertificate() {
    this.playAudio('complete');
    
    // Inyectar datos en el diploma
    document.getElementById('cert-recipient').textContent = this.state.user.name;
    
    // Generar código de validación único
    const hash = btoa(this.state.user.name + this.state.user.score).substring(0, 8).toUpperCase();
    document.getElementById('cert-val-code').textContent = `S7B-${hash}-SEC`;

    const modal = document.getElementById('certificate-modal');
    modal.classList.add('active');
  }

  hideCertificate() {
    this.playAudio('click');
    const modal = document.getElementById('certificate-modal');
    modal.classList.remove('active');
  }

  // --- INICIALIZACIÓN DE JUEGOS ---
  startPhishingGame() {
    this.navigateTo('phishing');
    games.phishing.init();
  }

  startPciGame() {
    this.navigateTo('pci');
    games.pci.init();
  }

  startIncidentGame() {
    this.navigateTo('incident');
    games.incident.init();
  }

  startPasswordGame() {
    this.navigateTo('password');
    games.password.init();
  }

  startUsbGame() {
    this.navigateTo('usb');
    games.usb.init();
  }

  // --- SISTEMA DE DIÁLOGOS DE SEGURIDAD PERSONALIZADOS (PROMISE-BASED) ---
  showModalAlert(options) {
    const { title = 'Notificación de Seguridad', message = '', type = 'info', callback = null } = options;
    
    return new Promise((resolve) => {
      const modal = document.getElementById('custom-dialog-modal');
      const dialogContent = modal.querySelector('.custom-dialog-content');
      const titleEl = document.getElementById('dialog-title');
      const msgEl = document.getElementById('dialog-message');
      const okBtn = document.getElementById('dialog-ok-btn');
      const cancelBtn = document.getElementById('dialog-cancel-btn');
      const iconEl = document.getElementById('dialog-icon');

      titleEl.textContent = title;
      msgEl.innerHTML = message;
      
      dialogContent.className = 'modal-content custom-dialog-content';
      dialogContent.classList.add(`dialog-${type}`);

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
      iconEl.textContent = icon;

      cancelBtn.style.display = 'none';
      modal.classList.add('active');

      const handleOk = () => {
        this.playAudio('click');
        modal.classList.remove('active');
        okBtn.removeEventListener('click', handleOk);
        if (callback) callback();
        resolve(true);
      };

      okBtn.addEventListener('click', handleOk);
    });
  }

  showModalConfirm(options) {
    const { title = 'Confirmar Operación', message = '', type = 'warning' } = options;

    return new Promise((resolve) => {
      const modal = document.getElementById('custom-dialog-modal');
      const dialogContent = modal.querySelector('.custom-dialog-content');
      const titleEl = document.getElementById('dialog-title');
      const msgEl = document.getElementById('dialog-message');
      const okBtn = document.getElementById('dialog-ok-btn');
      const cancelBtn = document.getElementById('dialog-cancel-btn');
      const iconEl = document.getElementById('dialog-icon');

      titleEl.textContent = title;
      msgEl.innerHTML = message;

      dialogContent.className = 'modal-content custom-dialog-content';
      dialogContent.classList.add(`dialog-${type}`);

      let icon = '❓';
      if (type === 'danger') icon = '🚨';
      else if (type === 'warning') icon = '⚠️';
      iconEl.textContent = icon;

      cancelBtn.style.display = 'block';

      this.playAudio('incident_alert');
      modal.classList.add('active');

      const cleanup = () => {
        modal.classList.remove('active');
        okBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
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

      okBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
    });
  }
}

// Declarar variable global de instancia
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new AppController();
  app.init();
});
