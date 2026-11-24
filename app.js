/**
 * Academia CiberSegura Corporación Suiche 7B - Core App Controller (v2.5 Fase 1 + Fase 2)
 * Manejo del Estado Global (SPA), control dinámico de Fases por Administrador (Fase 1 / Fase 2 / Ambas),
 * sincronización con API REST segura en PostgreSQL (JWT + Anti-Farming), insignias y certificados verificables.
 */

const PHASE1_KEYS = ['phishing', 'pci', 'incident', 'password', 'usb'];
const PHASE2_LEGACY_KEYS = ['ai_sec', 'pci_dss', 'quishing_mfa', 'bec_fraud', 'remote_vpn'];
const ARCADE_KEYS = ['arcade_jornada', 'arcade_bandeja', 'arcade_cartas', 'arcade_boveda'];
// Fase 2 oficial: los 4 juegos interactivos 3D (Zona Arcade 3D)
const PHASE2_KEYS = [...ARCADE_KEYS];
const ALL_MODULE_KEYS = [...PHASE1_KEYS, ...PHASE2_LEGACY_KEYS, ...ARCADE_KEYS];

const MODULE_LABELS = {
  phishing: '1. Phishing Detective (F1)',
  pci: '2. Oficina Segura Clean Desk (F1)',
  incident: '3. Alerta Vishing y SMS (F1)',
  password: '4. Fuerza Bruta Contraseñas (F1)',
  usb: '5. Trampas USB y Dispositivos (F1)',
  ai_sec: '6. IA Generativa y Fuga DLP (F2)',
  pci_dss: '7. PCI-DSS 4.0 Transaccional (F2)',
  quishing_mfa: '8. Quishing QR y Fatiga MFA (F2)',
  bec_fraud: '9. Fraude Ejecutivo BEC (F2)',
  remote_vpn: '10. Teletrabajo, VPN y Wi-Fi (F2)',
  arcade_jornada: 'A. Escudo de Red 3D: Defiende el Suiche (Arcade)',
  arcade_bandeja: 'B. Bandeja Blindada 3D (Arcade)',
  arcade_cartas: 'C. Caza-Fraudes Duelo Cartas (Arcade)',
  arcade_boveda: 'D. La Bóveda Digital 3D (Arcade)'
};

class AppController {
  constructor() {
    this.apiBaseUrl = '/api/v1';
    this.isServerOnline = false;
    this.userPhaseFilter = 'all'; // 'all', 'phase1', 'phase2'

    this.academyConfig = {
      activePhaseMode: 'phase2', // 'phase1', 'phase2', 'both'
      campaignName: 'Programa Anual de Concientización 2026',
      requirePhase1ForPhase2: false
    };

    this.state = {
      user: {
        id: null,
        name: '',
        department: '',
        score: 0,
        token: null,
        isAdmin: false,
        completedModules: {
          phishing: false,
          pci: false,
          incident: false,
          password: false,
          usb: false,
          ai_sec: false,
          pci_dss: false,
          quishing_mfa: false,
          bec_fraud: false,
          remote_vpn: false,
          arcade_jornada: false,
          arcade_bandeja: false,
          arcade_cartas: false,
          arcade_boveda: false
        },
        certificates: {},
        attempts: 0,
        correctAnswers: 0,
        totalQuestions: 0
      },
      audioEnabled: true,
      currentView: 'welcome'
    };

    this.audioCtx = null;
    this.adminUsers = [];
    this.leaderboardData = [
      { dept: 'Gerencia Seguridad de la Información', correctPercent: 98, totalScore: 980, count: 6 },
      { dept: 'Dirección Tecnología', correctPercent: 94, totalScore: 1250, count: 12 },
      { dept: 'Oficial de Cumplimiento', correctPercent: 92, totalScore: 760, count: 6 },
      { dept: 'Auditoría de Sistemas', correctPercent: 91, totalScore: 680, count: 4 },
      { dept: 'Comité de Riesgos', correctPercent: 90, totalScore: 620, count: 5 },
      { dept: 'Gerencia Operaciones y Servicio al Cliente', correctPercent: 89, totalScore: 1420, count: 18 },
      { dept: 'Dirección Finanzas', correctPercent: 86, totalScore: 890, count: 9 },
      { dept: 'Dirección Desarrollo Nuevos Negocios', correctPercent: 85, totalScore: 710, count: 6 },
      { dept: 'Presidencia Ejecutiva', correctPercent: 85, totalScore: 720, count: 8 },
      { dept: 'Gerencia Gestión Estratégica', correctPercent: 84, totalScore: 670, count: 5 },
      { dept: 'Gerencia Capital Humano', correctPercent: 83, totalScore: 640, count: 7 },
      { dept: 'Junta Directiva', correctPercent: 88, totalScore: 540, count: 5 }
    ];
  }

  async init() {
    this.loadState();

    await this.checkServerConnection();
    await this.fetchAcademySettingsFromDB();
    await this.fetchCustomScenariosFromDB();
    await this.fetchLeaderboardFromDB();

    // Inicializar Motor 3D de Red Interbancaria y Física 3D Tilt en Tarjetas
    this.init3DGlobeEngine();
    this.init3DTiltCards();

    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.textContent = this.state.audioEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
    }

    if (this.state.user.name) {
      // Refrescar progreso real del servidor si tiene ID numérico
      if (this.state.user.id && !this.state.user.isAdmin) {
        await this.refreshUserProfileFromServer();
      }
      this.showMainLayout();
      this.updateUI();
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

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.state.user && this.state.user.token) {
      headers['Authorization'] = `Bearer ${this.state.user.token}`;
    }
    return headers;
  }

  // --- COMPROBACIÓN DE CONEXIÓN CON EL SERVIDOR Y BASE DE DATOS ---
  async checkServerConnection() {
    try {
      const res = await fetch('/health', { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        this.isServerOnline = data.status === 'healthy' || data.database === 'connected';
      }
    } catch (e) {
      this.isServerOnline = false;
    }
  }

  async fetchAcademySettingsFromDB() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/settings/phase`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.academyConfig = { ...this.academyConfig, ...json.data };
        }
      }
    } catch (e) {
      console.warn('Usando configuración de fase local:', e);
    }
  }

  async fetchCustomScenariosFromDB() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/settings/scenarios`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && window.customizer) {
          window.customizer.applyFullConfigObject(json.data);
        }
      }
    } catch (e) {
      // Fallback a escenarios por defecto
    }
  }

  async refreshUserProfileFromServer() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/users/${this.state.user.id}`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.state.user.score = json.data.score || 0;
          this.state.user.correctAnswers = json.data.correctAnswers || 0;
          this.state.user.totalQuestions = json.data.totalQuestions || 0;
          if (json.data.completedModules) {
            this.state.user.completedModules = {
              ...this.state.user.completedModules,
              ...json.data.completedModules
            };
          }
          if (json.data.certificates) {
            this.state.user.certificates = json.data.certificates;
          }
          if (json.data.academyConfig) {
            this.academyConfig = { ...this.academyConfig, ...json.data.academyConfig };
          }
          this.saveState();
        }
      }
    } catch (e) {
      console.warn('No se pudo refrescar perfil desde el servidor:', e);
    }
  }

  // --- NAVEGACIÓN SINGLE PAGE APPLICATION (SPA) ---
  navigateTo(viewId) {
    this.currentView = viewId;
    document.body.setAttribute('data-view', viewId);

    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const activeSection = document.getElementById(`${viewId}-view`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const onclickAttr = link.getAttribute('onclick') || '';
      if (onclickAttr.includes(`'${viewId}'`)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    this.playAudio('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.arcade && typeof window.arcade.onNavigate === 'function') window.arcade.onNavigate(viewId);
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

    try {
      const submitBtn = document.querySelector('#register-form button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Conectando ...';
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
        this.state.user.token = result.data.token || null;
        this.state.user.isAdmin = Boolean(result.data.isAdmin);
        this.state.user.certificates = result.data.certificates || {};

        if (result.data.academyConfig) {
          this.academyConfig = { ...this.academyConfig, ...result.data.academyConfig };
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
    this.playAudio('complete');
    this.showMainLayout();
    this.updateUI();

    try {
      await this.fetchLeaderboardFromDB();
      this.renderLeaderboard();
    } catch (e) {
      console.warn('No se pudo cargar el leaderboard');
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

  // --- CONTROL DE FASES DESDE EL PANEL ADMIN ---
  updateAdminPhaseButtonsUI() {
    const mode = this.academyConfig.activePhaseMode || 'both';
    ['phase1', 'phase2', 'both'].forEach(m => {
      const btn = document.getElementById(`mode-btn-${m}`);
      if (btn) {
        if (m === mode) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    const indicator = document.getElementById('admin-current-phase-indicator');
    if (indicator) {
      const labels = {
        phase1: 'Modo Actual: Solo Fase 1 (Básico - 5 Módulos)',
        phase2: 'Modo Actual: Solo Fase 2 (Avanzado - 5 Módulos)',
        both: 'Modo Actual: Ambas Fases (10 Módulos)'
      };
      indicator.textContent = labels[mode] || labels.both;
    }

    const campaignInput = document.getElementById('admin-campaign-input');
    if (campaignInput && this.academyConfig.campaignName) {
      campaignInput.value = this.academyConfig.campaignName;
    }

    const reqCheckbox = document.getElementById('admin-require-p1-checkbox');
    if (reqCheckbox) {
      reqCheckbox.checked = Boolean(this.academyConfig.requirePhase1ForPhase2);
    }
  }

  async saveAdminPhaseMode(newMode) {
    this.academyConfig.activePhaseMode = newMode;
    this.updateAdminPhaseButtonsUI();
    await this.persistAdminPhaseSettings(true);
  }

  async saveAdminCampaignDetails() {
    const campaignInput = document.getElementById('admin-campaign-input');
    const reqCheckbox = document.getElementById('admin-require-p1-checkbox');

    if (campaignInput) {
      this.academyConfig.campaignName = campaignInput.value.trim() || 'Programa Anual de Concientización 2026';
    }
    if (reqCheckbox) {
      this.academyConfig.requirePhase1ForPhase2 = Boolean(reqCheckbox.checked);
    }

    await this.persistAdminPhaseSettings(true);
  }

  async persistAdminPhaseSettings(showNotification = true) {
    this.saveState();
    this.updateUI();

    try {
      const res = await fetch(`${this.apiBaseUrl}/settings/phase`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(this.academyConfig)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        this.academyConfig = { ...this.academyConfig, ...data.data };
        this.updateAdminPhaseButtonsUI();
        this.updateUI();
        if (showNotification) {
          const modeNames = {
            phase1: 'Solo Fase 1 (5 Módulos Básicos)',
            phase2: 'Solo Fase 2 (5 Módulos Avanzados)',
            both: 'Ambas Fases Activas (10 Módulos)'
          };
          this.showModalAlert({
            title: '⚙️ Configuración de Fases Actualizada',
            message: `Se ha activado exitosamente el modo: <strong>${modeNames[this.academyConfig.activePhaseMode]}</strong> para todos los colaboradores de Corporación Suiche 7B.`,
            type: 'success'
          });
        }
      }
    } catch (e) {
      console.error('Error guardando configuración de fase:', e);
    }
  }

  // --- FILTRO DE PESTAÑAS DE FASE EN DASHBOARD DE COLABORADOR ---
  setUserPhaseFilter(filter) {
    this.userPhaseFilter = filter;
    ['all', 'phase1', 'phase2', 'arcade'].forEach(f => {
      const btn = document.getElementById(`tab-btn-${f}`);
      if (btn) {
        if (f === filter) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
    this.playAudio('click');
    this.updatePhaseVisibilityUI();
  }

  updatePhaseVisibilityUI() {
    const mode = this.academyConfig.activePhaseMode || 'phase2';
    const p1Block = document.getElementById('phase1-section-block');
    const p2LegacyBlock = document.getElementById('phase2-section-block');
    const arcBlock = document.getElementById('arcade-section-block');
    const tabsBar = document.getElementById('user-phase-tabs');
    const phaseBadge = document.getElementById('dash-active-phase-badge');
    const campaignBadge = document.getElementById('dash-campaign-badge');

    if (campaignBadge) {
      campaignBadge.textContent = this.academyConfig.campaignName || 'Programa Anual de Concientización 2026';
    }

    // Los 5 módulos anteriores de Fase 2 permanecen ocultos; la nueva Fase 2 son los 4 juegos 3D (#arcade-section-block)
    if (p2LegacyBlock) p2LegacyBlock.style.display = 'none';

    if (mode === 'phase1') {
      if (tabsBar) tabsBar.style.display = 'none';
      if (p1Block) p1Block.style.display = 'block';
      if (arcBlock) arcBlock.style.display = 'none';
      if (phaseBadge) phaseBadge.textContent = '🛡️ Fase 1 Activa (Nivel Básico)';
    } else if (mode === 'phase2') {
      if (tabsBar) tabsBar.style.display = 'none';
      if (p1Block) p1Block.style.display = 'none';
      if (arcBlock) arcBlock.style.display = 'block';
      if (phaseBadge) phaseBadge.textContent = '🚀 Fase 2 Activa: Juegos Interactivos 3D';
    } else {
      // mode === 'both'
      if (tabsBar) tabsBar.style.display = 'flex';
      if (phaseBadge) phaseBadge.textContent = '⚡ Fase 1 y Fase 2 Activas';

      if (this.userPhaseFilter === 'phase1') {
        if (p1Block) p1Block.style.display = 'block';
        if (arcBlock) arcBlock.style.display = 'none';
      } else if (this.userPhaseFilter === 'phase2' || this.userPhaseFilter === 'arcade') {
        if (p1Block) p1Block.style.display = 'none';
        if (arcBlock) arcBlock.style.display = 'block';
      } else {
        if (p1Block) p1Block.style.display = 'block';
        if (arcBlock) arcBlock.style.display = 'block';
      }
    }

    // Verificar si Fase 2 requiere Fase 1 completada
    const p1DoneCount = PHASE1_KEYS.filter(k => this.state.user.completedModules[k]).length;
    const isPhase2Locked = (mode === 'both' && this.academyConfig.requirePhase1ForPhase2 && p1DoneCount < 5 && !this.state.user.isAdmin);
    const lockedBanner = document.getElementById('phase2-locked-banner');
    const p2CardsGrid = document.getElementById('phase2-cards-grid');

    if (lockedBanner) {
      lockedBanner.style.display = isPhase2Locked ? 'block' : 'none';
    }
    if (p2CardsGrid) {
      p2CardsGrid.style.opacity = isPhase2Locked ? '0.45' : '1';
      p2CardsGrid.style.pointerEvents = isPhase2Locked ? 'none' : 'auto';
    }
  }

  // --- CARGA DEL DASHBOARD ADMIN ---
  async loadAdminDashboard() {
    if (!this.state.user.isAdmin) return;
    this.updateAdminPhaseButtonsUI();

    try {
      const summaryRes = await fetch(`${this.apiBaseUrl}/stats/summary`, {
        headers: this.getAuthHeaders()
      });
      const summaryData = await summaryRes.json();

      if (summaryData.success && summaryData.data) {
        const d = summaryData.data;
        if (d.academyConfig) {
          this.academyConfig = { ...this.academyConfig, ...d.academyConfig };
          this.updateAdminPhaseButtonsUI();
        }
        document.getElementById('admin-total-score').innerText = `${d.totalScore || 0} PTS`;
        document.getElementById('admin-total-modules').innerText = d.totalModulesCompleted || 0;
        const p1El = document.getElementById('admin-p1-modules');
        const p2El = document.getElementById('admin-p2-modules');
        if (p1El) p1El.innerText = d.phase1ModulesCompleted || 0;
        if (p2El) p2El.innerText = d.phase2ModulesCompleted || 0;
        document.getElementById('admin-success-rate').innerText = `${d.successRate || 0}%`;
        document.getElementById('admin-user-count').innerText = `${d.totalUsers || 0} colaboradores registrados`;
      }

      const usersRes = await fetch(`${this.apiBaseUrl}/stats/users`, {
        headers: this.getAuthHeaders()
      });
      const usersData = await usersRes.json();

      if (usersData.success) {
        this.adminUsers = usersData.data;
        this.renderAdminUsers(this.adminUsers);
        this.renderAdminDeptBreakdown(this.adminUsers);
      }
    } catch (e) {
      console.error('Error al cargar panel de auditoría:', e);
    }
  }

  renderAdminDeptBreakdown(users) {
    const container = document.getElementById('admin-dept-breakdown');
    if (!container) return;

    const deptMap = {};
    users.forEach(u => {
      const dept = u.department || 'Área General';
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, totalScore: 0, completedMods: 0 };
      }
      deptMap[dept].count++;
      deptMap[dept].totalScore += parseInt(u.total_score || 0, 10);
      deptMap[dept].completedMods += parseInt(u.modules_completed || 0, 10);
    });

    const entries = Object.entries(deptMap).sort((a, b) => b[1].totalScore - a[1].totalScore);
    if (entries.length === 0) {
      container.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted);">Sin registros aún.</span>';
      return;
    }

    container.innerHTML = entries.map(([dept, info]) => {
      const targetPerUser = this.academyConfig.activePhaseMode === 'both' ? 10 : 5;
      const pct = Math.min(100, Math.round((info.completedMods / (info.count * targetPerUser)) * 100));
      return `
        <div style="font-size:0.78rem; background:rgba(255,255,255,0.02); padding:0.45rem 0.65rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
            <strong>${dept} <span style="color:var(--text-muted); font-weight:400;">(${info.count} colab.)</span></strong>
            <span style="color:var(--accent-cyan); font-family:var(--font-mono);">${pct}% avance · ${info.totalScore} PTS</span>
          </div>
          <div style="height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--primary-blue), var(--accent-cyan));"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  filterAdminUsers(searchTerm) {
    const query = searchTerm.trim().toLocaleLowerCase();
    const filteredUsers = this.adminUsers.filter(user =>
      user.full_name.toLocaleLowerCase().includes(query) ||
      (user.department || '').toLocaleLowerCase().includes(query)
    );
    this.renderAdminUsers(filteredUsers);
  }

  renderAdminUsers(users) {
    const tbody = document.getElementById('admin-users-table');
    if (!tbody) return;
    tbody.innerHTML = '';

    users.forEach(u => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      const lastActivityDate = new Date(u.last_activity || u.created_at).toLocaleString('es-VE');
      const p1Count = u.phase1_completed !== undefined ? u.phase1_completed : u.modules_completed;
      const p2Count = u.phase2_completed !== undefined ? u.phase2_completed : 0;

      row.innerHTML = `
        <td style="padding:0.85rem; font-weight:600;">${u.full_name}</td>
        <td style="padding:0.85rem; color:var(--text-muted);">${u.department || 'Área General'}</td>
        <td style="padding:0.85rem; color:var(--accent-cyan); font-weight:bold; font-family:var(--font-mono);">${u.total_score} PTS</td>
        <td style="padding:0.85rem;"><span class="game-status-badge ${Number(p1Count) >= 5 ? 'status-completed' : 'status-pending'}">${p1Count} / 5</span></td>
        <td style="padding:0.85rem;"><span class="game-status-badge ${Number(p2Count) >= 4 ? 'status-completed' : 'status-pending'}">${p2Count} / 4</span></td>
        <td style="padding:0.85rem; font-weight:600;">${u.modules_completed} / 9</td>
        <td style="padding:0.85rem; font-size:0.78rem; color:var(--text-muted);">${lastActivityDate}</td>
        <td style="padding:0.85rem;">
          <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.72rem;" onclick="app.showAdminUserDetail(${u.id})">
            🔍 Ver Módulos
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  showAdminUserDetail(userId) {
    const user = this.adminUsers.find(u => Number(u.id) === Number(userId));
    if (!user) return;

    const completedSet = new Set(Array.isArray(user.completed_keys) ? user.completed_keys : []);
    const p1Html = PHASE1_KEYS.map(k => {
      const done = completedSet.has(k);
      return `<div style="margin-bottom:0.25rem;">${done ? '✅' : '⏳'} ${MODULE_LABELS[k]}</div>`;
    }).join('');
    const p2Html = PHASE2_KEYS.map(k => {
      const done = completedSet.has(k);
      return `<div style="margin-bottom:0.25rem;">${done ? '✅' : '⏳'} ${MODULE_LABELS[k]}</div>`;
    }).join('');

    this.showModalAlert({
      title: `👤 Expediente de Auditoría: ${user.full_name}`,
      message: `
        <div style="text-align:left; font-size:0.84rem; line-height:1.5;">
          <p><strong>Departamento:</strong> ${user.department || 'Área General'} | <strong>Puntaje:</strong> ${user.total_score} PTS</p>
          <hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:0.6rem 0;">
          <strong style="color:var(--accent-green);">Fase 1: Nivel Básico (${user.phase1_completed || 0}/5)</strong>
          <div style="margin:0.4rem 0 0.8rem;">${p1Html}</div>
          <strong style="color:var(--accent-cyan);">Fase 2: Nivel Especialista (${user.phase2_completed || 0}/5)</strong>
          <div style="margin-top:0.4rem;">${p2Html}</div>
        </div>
      `,
      type: 'info'
    });
  }

  async verifyCertificateFromAdmin() {
    const input = document.getElementById('admin-verify-cert-input');
    const resultBox = document.getElementById('admin-verify-cert-result');
    if (!input || !resultBox) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      resultBox.innerHTML = '<span style="color:var(--accent-cyan);">Ingresa un código para consultar.</span>';
      return;
    }

    try {
      const res = await fetch(`${this.apiBaseUrl}/certificates/verify/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.valid && data.data) {
        const c = data.data;
        const phaseLabel = c.phase === 'phase1' ? 'Fase 1 (Básico)' : c.phase === 'phase2' ? 'Fase 2 (Especialista)' : 'Maestro Integral';
        resultBox.innerHTML = `
          <div style="padding:0.6rem; border-radius:6px; background:rgba(53,126,50,0.18); border:1px solid var(--accent-green); color:#bbf7d0;">
            ✅ <strong>Certificado Válido:</strong> ${c.certificate_code}<br>
            👤 <strong>Colaborador:</strong> ${c.full_name} (${c.department || 'Corporación Suiche 7B'})<br>
            🏅 <strong>Nivel:</strong> ${phaseLabel} | <strong>Puntaje:</strong> ${c.score_at_issue} PTS | <strong>Fecha:</strong> ${new Date(c.issued_at).toLocaleDateString('es-VE')}
          </div>
        `;
      } else {
        resultBox.innerHTML = `
          <div style="padding:0.6rem; border-radius:6px; background:rgba(182,14,128,0.18); border:1px solid var(--accent-red); color:#fecdd3;">
            ❌ ${data.message || 'Código no encontrado en los registros oficiales.'}
          </div>
        `;
      }
    } catch (e) {
      resultBox.innerHTML = '<span style="color:var(--accent-red);">Error al verificar certificado.</span>';
    }
  }

  showMainLayout() {
    const mainNav = document.getElementById('main-nav');
    const userWidget = document.getElementById('user-widget');
    const logoutBtn = document.getElementById('logout-btn');
    const adminLink = document.getElementById('nav-admin-link');
    const customizerLink = document.getElementById('nav-customizer-link');

    if (mainNav) mainNav.style.display = 'flex';
    if (userWidget) userWidget.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'block';

    if (this.state.user.isAdmin) {
      if (adminLink) adminLink.style.display = 'flex';
      if (customizerLink) customizerLink.style.display = 'flex';
    } else {
      if (adminLink) adminLink.style.display = 'none';
      if (customizerLink) customizerLink.style.display = 'none';
    }
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
            user: {
              ...this.state.user,
              ...parsed.user,
              completedModules: {
                ...this.state.user.completedModules,
                ...(parsed.user.completedModules || {})
              }
            }
          };
        }
        if (parsed.customGamesConfig && window.customizer) {
          window.customizer.applyFullConfigObject(parsed.customGamesConfig);
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
      if (this.state.user.id) {
        try {
          await fetch(`${this.apiBaseUrl}/progress/reset/${this.state.user.id}`, {
            method: 'POST',
            headers: this.getAuthHeaders()
          });
        } catch (e) {
          console.warn('Error reiniciando en servidor:', e);
        }
      }

      localStorage.removeItem('s7b_cybershield_state');
      location.reload();
    }
  }

  // --- ACTUALIZACIONES DE INTERFAZ DE USUARIO ---
  updateUI() {
    if (!this.state.user.name) return;

    const nameEl = document.getElementById('dash-user-name');
    if (nameEl) nameEl.textContent = this.state.user.name;

    const widgetScore = document.getElementById('widget-score');
    if (widgetScore) widgetScore.textContent = this.state.user.score;
    const level = this.getSecurityLevel(this.state.user.score);
    const widgetLevel = document.getElementById('widget-level');
    if (widgetLevel) widgetLevel.textContent = level;

    const statsScore = document.getElementById('stats-score');
    if (statsScore) statsScore.textContent = `${this.state.user.score} PTS`;
    const statsLevel = document.getElementById('stats-level-text');
    if (statsLevel) statsLevel.textContent = level;

    const p1Completed = PHASE1_KEYS.filter(k => this.state.user.completedModules[k]).length;
    const p2Completed = PHASE2_KEYS.filter(k => this.state.user.completedModules[k]).length;
    const totalCompleted = p1Completed + p2Completed;

    const statsP1 = document.getElementById('stats-modules-p1');
    if (statsP1) statsP1.textContent = `${p1Completed} / 5`;

    const statsP2 = document.getElementById('stats-modules-p2');
    if (statsP2) statsP2.textContent = `${p2Completed} / 4`;

    const mode = this.academyConfig.activePhaseMode || 'phase2';
    const activeTarget = mode === 'phase1' ? 5 : mode === 'phase2' ? 4 : 9;
    const activeDone = mode === 'phase1' ? p1Completed : mode === 'phase2' ? p2Completed : totalCompleted;

    const statsModules = document.getElementById('stats-modules');
    if (statsModules) statsModules.textContent = `${activeDone} / ${activeTarget}`;

    const p1Pill = document.getElementById('phase1-progress-pill');
    if (p1Pill) {
      p1Pill.textContent = `${p1Completed} / 5 Completados`;
      p1Pill.className = `game-status-badge ${p1Completed === 5 ? 'status-completed' : 'status-pending'}`;
    }

    const p2Pill = document.getElementById('phase2-progress-pill');
    if (p2Pill) {
      p2Pill.textContent = `${p2Completed} / 4 Completados`;
      p2Pill.className = `game-status-badge ${p2Completed === 4 ? 'status-completed' : 'status-pending'}`;
    }

    const arcPill = document.getElementById('arcade-progress-pill');
    if (arcPill) {
      arcPill.textContent = `${p2Completed} / 4 Completados`;
      arcPill.className = `game-status-badge ${p2Completed === 4 ? 'status-completed' : 'status-pending'}`;
    }

    const accuracy = this.state.user.totalQuestions > 0
      ? Math.min(100, Math.round((this.state.user.correctAnswers / this.state.user.totalQuestions) * 100))
      : 0;
    const statsAccuracy = document.getElementById('stats-accuracy');
    if (statsAccuracy) statsAccuracy.textContent = `${accuracy}%`;

    // Actualizar badges de estado y bloqueo anti-farming de todos los módulos
    ALL_MODULE_KEYS.forEach(modKey => {
      this.updateStatusBadge(modKey, Boolean(this.state.user.completedModules[modKey]));
    });

    // Botones de certificados por Fase
    const certP1 = document.getElementById('cert-grant-phase1');
    const certP2 = document.getElementById('cert-grant-phase2');
    if (certP1) {
      certP1.style.display = (p1Completed === 5 && (mode === 'phase1' || mode === 'both')) ? 'block' : 'none';
    }
    if (certP2) {
      certP2.style.display = (p2Completed === 4 && (mode === 'phase2' || mode === 'both')) ? 'block' : 'none';
    }

    this.updatePhaseVisibilityUI();
    this.renderUserBadges(p1Completed, p2Completed);
    this.renderSkillsRadar();
  }

  // --- GRÁFICO DE RADAR HEXAGONAL DE COMPETENCIAS CIBERSEGURAS (SVG DINÁMICO) ---
  renderSkillsRadar() {
    const container = document.getElementById('skills-radar-container');
    if (!container) return;

    const cm = this.state.user.completedModules;
    const axes = [
      { label: 'Phishing', val: cm.phishing ? 100 : 25 },
      { label: 'Física/USB', val: (cm.pci ? 50 : 12) + (cm.usb ? 50 : 13) },
      { label: 'Vishing/BEC', val: (cm.incident ? 50 : 12) + (cm.bec_fraud ? 50 : 13) },
      { label: 'Claves/MFA', val: (cm.password ? 50 : 12) + (cm.quishing_mfa ? 50 : 13) },
      { label: 'PCI-DSS 4.0', val: cm.pci_dss ? 100 : 25 },
      { label: 'IA / VPN', val: (cm.ai_sec ? 50 : 12) + (cm.remote_vpn ? 50 : 13) }
    ];

    const size = 210;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = 68;

    const getPoint = (idx, radiusRatio) => {
      const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
      const r = maxR * radiusRatio;
      return {
        x: (cx + r * Math.cos(angle)).toFixed(1),
        y: (cy + r * Math.sin(angle)).toFixed(1)
      };
    };

    const ringsHtml = [0.33, 0.66, 1.0].map(ratio => {
      const pts = axes.map((_, i) => {
        const p = getPoint(i, ratio);
        return `${p.x},${p.y}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
    }).join('');

    const spokesHtml = axes.map((axis, i) => {
      const end = getPoint(i, 1.0);
      const lbl = getPoint(i, 1.26);
      return `
        <line x1="${cx}" y1="${cy}" x2="${end.x}" y2="${end.y}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="${lbl.x}" y="${lbl.y}" fill="#94a3b8" font-size="8.5" font-weight="600" text-anchor="middle" dominant-baseline="middle">${axis.label}</text>
      `;
    }).join('');

    const dataPoints = axes.map((axis, i) => {
      const p = getPoint(i, axis.val / 100);
      return `${p.x},${p.y}`;
    }).join(' ');

    const dotsHtml = axes.map((axis, i) => {
      const p = getPoint(i, axis.val / 100);
      return `<circle cx="${p.x}" cy="${p.y}" r="3.2" fill="#fbba0a" stroke="#060913" stroke-width="1.2"/>`;
    }).join('');

    container.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow:visible;">
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(0, 94, 156, 0.65)"/>
            <stop offset="100%" stop-color="rgba(251, 186, 10, 0.55)"/>
          </linearGradient>
        </defs>
        ${ringsHtml}
        ${spokesHtml}
        <polygon points="${dataPoints}" fill="url(#radarGrad)" stroke="#fbba0a" stroke-width="2" style="transition: all 0.5s ease;"/>
        ${dotsHtml}
      </svg>
    `;
  }

  // --- MOTOR 3D ULTRALIGERO: ESFERA INTERBANCARIA Y RED DE NODOS EN TIEMPO REAL ---
  init3DGlobeEngine() {
    const canvas = document.getElementById('cyber-globe-3d-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Crear 42 nodos distribuidos en una esfera 3D (Fibonacci Sphere)
    const numNodes = 42;
    const nodes = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numNodes; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numNodes);
      nodes.push({
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        color: i % 5 === 0 ? '#fbba0a' : i % 3 === 0 ? '#b60e80' : '#0088ff'
      });
    }

    let rotY = 0;
    let rotX = 0.25;
    let targetRotX = 0.25;
    let targetRotYSpeed = 0.003;

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / width) - 0.5;
      const ny = (e.clientY / height) - 0.5;
      targetRotX = 0.25 + ny * 0.5;
      targetRotYSpeed = 0.003 + nx * 0.006;
    }, { passive: true });

    const renderFrame = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, width, height);

        rotY += targetRotYSpeed;
        rotX += (targetRotX - rotX) * 0.05;

        const radius = Math.min(width, height) * 0.36;
        const fov = 550;
        const cx = width * 0.5;
        const cy = height * 0.5;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const projected = nodes.map(n => {
          // Rotación 3D en eje Y y eje X
          const x1 = n.x * radius * cosY - n.z * radius * sinY;
          const z1 = n.z * radius * cosY + n.x * radius * sinY;
          const y2 = n.y * radius * cosX - z1 * sinX;
          const z2 = z1 * cosX + n.y * radius * sinX;

          const scale = fov / (fov + z2 + 220);
          return {
            px: cx + x1 * scale,
            py: cy + y2 * scale,
            z: z2,
            scale,
            color: n.color
          };
        });

        // Dibujar conexiones 3D cercanas
        ctx.lineWidth = 1;
        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const a = projected[i];
            const b = projected[j];
            const dx = a.px - b.px;
            const dy = a.py - b.py;
            const distSq = dx * dx + dy * dy;
            if (distSq < 18500) {
              const alpha = (1 - distSq / 18500) * 0.22;
              ctx.strokeStyle = `rgba(0, 150, 255, ${alpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(a.px, a.py);
              ctx.lineTo(b.px, b.py);
              ctx.stroke();
            }
          }
        }

        // Dibujar nodos con profundidad 3D
        projected.forEach(p => {
          const r = Math.max(1.5, 3.6 * p.scale);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.2, Math.min(0.85, p.scale));
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  }

  // --- FÍSICA 3D TILT & HOLOGRAPHIC GLARE EN TARJETAS Y DIPLOMA ---
  init3DTiltCards() {
    const attachTilt = (card, maxDeg = 8) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pctX = (x / rect.width) - 0.5;
        const pctY = (y / rect.height) - 0.5;

        const rotX = (-pctY * maxDeg * 2).toFixed(2);
        const rotY = (pctX * maxDeg * 2).toFixed(2);

        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    };

    document.querySelectorAll('.game-card, .phase-mode-card, .certificate-frame').forEach(el => {
      attachTilt(el, 7);
    });
  }

  // --- EXPLOSIÓN DE PARTÍCULAS 3D AL MOSTRAR CERTIFICADO ---
  launchCertificateParticles() {
    const canvas = document.getElementById('cert-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 65 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      size: 3 + Math.random() * 5,
      color: ['#fbba0a', '#0088ff', '#b60e80', '#4ade80'][Math.floor(Math.random() * 4)],
      alpha: 1
    }));

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravedad
        p.alpha = Math.max(0, 1 - frame / 95);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;
      if (frame < 95) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    requestAnimationFrame(animate);
  }

  renderUserBadges(p1Completed, p2Completed) {
    const container = document.getElementById('user-badges-container');
    if (!container) return;

    const cm = this.state.user.completedModules;
    const badges = [
      { icon: '🕵️', name: 'Cazador de Phishing', unlocked: cm.phishing, desc: 'Módulo Phishing superado' },
      { icon: '🧹', name: 'Escritorio Blindado', unlocked: cm.pci, desc: 'Política Clean Desk' },
      { icon: '💳', name: 'Guardián PCI-DSS 4.0', unlocked: cm.pci_dss, desc: 'Protección de Tarjetas' },
      { icon: '🤖', name: 'Centinela IA / DLP', unlocked: cm.ai_sec, desc: 'Prevención Shadow AI' },
      { icon: '🏅', name: 'Graduado Fase 1', unlocked: p1Completed === 5, desc: '5/5 Módulos Básicos' },
      { icon: '🕹️', name: 'Campeón Arcade 3D', unlocked: ARCADE_KEYS.some(k => cm[k]), desc: 'Superó un Juego de la Zona Arcade 3D' },
      { icon: '👑', name: 'Maestro CiberSeguro', unlocked: p1Completed === 5 && p2Completed === 5, desc: '10/10 Fase 1 + Fase 2' }
    ];

    container.innerHTML = badges.map(b => `
      <div class="badge-chip ${b.unlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
        <span class="badge-chip-icon">${b.icon}</span>
        <span class="badge-chip-name">${b.name}</span>
      </div>
    `).join('');
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
    const startBtn = document.getElementById(`btn-start-${gameId}`);
    if (startBtn) {
      if (isCompleted) {
        startBtn.disabled = true;
        startBtn.textContent = '🔒 Completado (1/1)';
        startBtn.style.opacity = '0.6';
        startBtn.style.cursor = 'not-allowed';
      } else {
        startBtn.disabled = false;
        if (startBtn.dataset && startBtn.dataset.label) startBtn.textContent = startBtn.dataset.label;
        startBtn.style.opacity = '';
        startBtn.style.cursor = '';
      }
    }
  }

  getSecurityLevel(score) {
    if (score >= 1000) return 'Maestro CiberSeguro Corporación Suiche 7B (Élite F1+F2)';
    if (score >= 600) return 'Centinela de Corporación Suiche 7B';
    if (score >= 380) return 'Guardián de Datos Transaccionales';
    if (score >= 220) return 'Analista de Defensa';
    if (score >= 100) return 'Operador Alerta';
    return 'Novicio de Seguridad';
  }

  // Agregar puntuación al usuario y sincronizar con base de datos (Con control Anti-Farming)
  async addPoints(points, isCorrectAnswer = true, moduleKey = null) {
    const activeModule = moduleKey || this.currentView;
    const alreadyCompleted = Boolean(this.state.user.completedModules[activeModule]);

    // Si el módulo no había sido completado aún, sumar localmente de forma inmediata
    if (!alreadyCompleted) {
      this.state.user.score += points;
      this.state.user.totalQuestions++;
      if (isCorrectAnswer) {
        this.state.user.correctAnswers++;
      }
    }

    this.saveState();
    this.updateUI();

    if (this.state.user.id && ALL_MODULE_KEYS.includes(activeModule)) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/progress/update`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            userId: this.state.user.id,
            moduleKey: activeModule,
            scoreEarned: points,
            isCompleted: alreadyCompleted,
            isCorrectAnswer: isCorrectAnswer
          })
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            // Sincronizar con el valor autoritativo anti-farming de PostgreSQL
            this.state.user.score = resJson.data.score;
            this.state.user.correctAnswers = resJson.data.correctAnswers;
            this.state.user.totalQuestions = resJson.data.totalQuestions;
            this.saveState();
            this.updateUI();
          }
        }
      } catch (err) {
        console.warn('Error sincronizando puntos con backend:', err);
      }
    }
  }

  async markModuleCompleted(moduleId, scoreBonus = 0) {
    const wasAlreadyCompleted = Boolean(this.state.user.completedModules[moduleId]);
    this.state.user.completedModules[moduleId] = true;
    if (!wasAlreadyCompleted && scoreBonus > 0) {
      this.state.user.score += scoreBonus;
    }
    this.saveState();
    this.updateUI();

    if (this.state.user.id) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/progress/update`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            userId: this.state.user.id,
            moduleKey: moduleId,
            scoreEarned: scoreBonus,
            isCompleted: true,
            isCorrectAnswer: true
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            this.state.user.score = json.data.score;
            if (json.data.certificates) {
              this.state.user.certificates = json.data.certificates;
            }
            this.saveState();
            this.updateUI();
          }
        }
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

    if (this.state.user.name && this.state.user.department) {
      const userDeptName = this.state.user.department.toLowerCase();
      leaderboard.forEach(d => {
        d.isUserDept = Boolean(d.dept && d.dept.toLowerCase().includes(userDeptName.substring(0, 5)));
      });
    }

    leaderboard.sort((a, b) => (b.totalScore || b.correctPercent || 0) - (a.totalScore || a.correctPercent || 0));

    container.innerHTML = '';
    leaderboard.slice(0, 8).forEach((item, index) => {
      const rank = index + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
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
      scoreSpan.textContent = item.totalScore !== undefined
        ? `${item.totalScore} PTS (${item.correctPercent || 0}%)`
        : `${item.correctPercent || 0}%`;

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

  // --- MODAL DE CERTIFICADOS (SOPORTA FASE 1 Y FASE 2 VERIFICABLES EN BD) ---
  showCertificate(phase = 'phase1') {
    this.playAudio('complete');

    const recipient = document.getElementById('cert-recipient');
    if (recipient) recipient.textContent = this.state.user.name;

    const phaseLabel = document.getElementById('cert-phase-label');
    if (phaseLabel) {
      if (phase === 'phase2') {
        phaseLabel.textContent = '(Fase 2: Seguridad Transaccional e IA)';
      } else {
        phaseLabel.textContent = '(Fase 1: Ciberseguridad Corporativa)';
      }
    }

    // Usar el código oficial emitido por PostgreSQL si está disponible, o generar código determinístico compatible
    const serverCert = this.state.user.certificates && this.state.user.certificates[phase];
    let codeText;
    if (serverCert && serverCert.code) {
      codeText = serverCert.code;
    } else {
      const prefix = phase === 'phase2' ? 'F2' : 'F1';
      const hash = btoa(encodeURIComponent(this.state.user.name + phase)).replace(/[^A-Z0-9]/gi, '').substring(0, 6).toUpperCase();
      const uid = String(this.state.user.id || 1).padStart(3, '0');
      codeText = `S7B-${prefix}-${uid}-${hash}`;
    }

    const valCode = document.getElementById('cert-val-code');
    if (valCode) valCode.textContent = codeText;

    const modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.add('active');
    this.launchCertificateParticles();
  }

  hideCertificate() {
    this.playAudio('click');
    const modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.remove('active');
  }

  // --- INICIALIZACIÓN DE JUEGOS (FASE 1 Y FASE 2) ---
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

  // Inicializadores Fase 2
  startAiSecGame() {
    this.navigateTo('ai_sec');
    if (window.games && games.ai_sec) games.ai_sec.init();
  }

  startPciDssGame() {
    this.navigateTo('pci_dss');
    if (window.games && games.pci_dss) games.pci_dss.init();
  }

  startQuishingMfaGame() {
    this.navigateTo('quishing_mfa');
    if (window.games && games.quishing_mfa) games.quishing_mfa.init();
  }

  startBecFraudGame() {
    this.navigateTo('bec_fraud');
    if (window.games && games.bec_fraud) games.bec_fraud.init();
  }

  startRemoteVpnGame() {
    this.navigateTo('remote_vpn');
    if (window.games && games.remote_vpn) games.remote_vpn.init();
  }

  // Fase 2 Oficial: Juegos Interactivos 3D (Anti-Farming estricto: 1 solo intento)
  startArcadeGame(key) {
    if (this.state.user.completedModules[key]) {
      this.showModalAlert({
        title: '🔒 Módulo Ya Completado (Anti-Farming)',
        message: 'Ya completaste este desafío de la Fase 2. Por política Anti-Farming solo se permite un intento por colaborador.',
        type: 'info'
      });
      return;
    }
    this.navigateTo(key);
    if (window.arcade) window.arcade.open(key);
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
    const table = document.querySelector('#admin-dashboard-view table');
    if (!table) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const rowData = [];
      const cols = row.querySelectorAll('th, td');
      // Omitir la última columna de botón "Detalle"
      for (let i = 0; i < cols.length - 1; i++) {
        const text = cols[i].innerText.replace(/"/g, '""');
        rowData.push(`"${text}"`);
      }
      csvContent += rowData.join(';') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'auditoria_suiche7b_' + new Date().toISOString().split('T')[0] + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportTableToPDF() {
    if (typeof html2pdf === 'undefined') {
      this.showModalAlert({ title: 'Exportación no disponible', message: 'No se pudo cargar el componente de PDF.', type: 'danger' });
      return;
    }

    const originalBtn = document.querySelector('button[onclick="app.exportTableToPDF()"]');
    if (originalBtn) {
      originalBtn.disabled = true;
      originalBtn.textContent = 'Generando PDF...';
    }

    const generatedAt = new Date().toLocaleString('es-VE', { dateStyle: 'long', timeStyle: 'short' });
    const totalScore = document.getElementById('admin-total-score')?.textContent || '0 PTS';
    const p1Modules = document.getElementById('admin-p1-modules')?.textContent || '0';
    const p2Modules = document.getElementById('admin-p2-modules')?.textContent || '0';
    const completedModules = document.getElementById('admin-total-modules')?.textContent || '0';
    const successRate = document.getElementById('admin-success-rate')?.textContent || '0%';

    const element = document.createElement('div');
    element.style.cssText = 'width:100%; padding:24px 28px; color:#172033; background:#ffffff; font-family:Arial,sans-serif;';
    element.innerHTML = `
      <header style="display:flex; align-items:center; justify-content:space-between; padding-bottom:14px; border-bottom:3px solid #005e9c;">
        <div style="display:flex; align-items:center; gap:14px;">
          <img src="img/logo-suiche7b.png" alt="Suiche 7B" style="height:38px; width:auto;">
          <div>
            <div style="font-size:17px; font-weight:700; color:#005e9c;">Reporte Ejecutivo de Auditoría — Fase 1 y Fase 2</div>
            <div style="font-size:10px; color:#536175; margin-top:3px;">Academia CiberSegura - Corporación Suiche 7B (${this.academyConfig.campaignName})</div>
          </div>
        </div>
        <div style="text-align:right; font-size:10px; color:#536175; line-height:1.5;">Generado el<br><strong style="color:#172033;">${generatedAt}</strong></div>
      </header>
      <section style="display:flex; gap:10px; margin:16px 0;">
        <div style="flex:1; padding:8px 10px; border:1px solid #dbe3ee; border-left:4px solid #fbba0a; background:#f8fafc;"><div style="font-size:8px; color:#536175; text-transform:uppercase;">Puntaje total</div><div style="font-size:16px; font-weight:700; margin-top:2px;">${totalScore}</div></div>
        <div style="flex:1; padding:8px 10px; border:1px solid #dbe3ee; border-left:4px solid #357e32; background:#f8fafc;"><div style="font-size:8px; color:#536175; text-transform:uppercase;">Módulos Fase 1</div><div style="font-size:16px; font-weight:700; margin-top:2px;">${p1Modules}</div></div>
        <div style="flex:1; padding:8px 10px; border:1px solid #dbe3ee; border-left:4px solid #b60e80; background:#f8fafc;"><div style="font-size:8px; color:#536175; text-transform:uppercase;">Módulos Fase 2</div><div style="font-size:16px; font-weight:700; margin-top:2px;">${p2Modules}</div></div>
        <div style="flex:1; padding:8px 10px; border:1px solid #dbe3ee; border-left:4px solid #005e9c; background:#f8fafc;"><div style="font-size:8px; color:#536175; text-transform:uppercase;">Total / Precisión</div><div style="font-size:16px; font-weight:700; margin-top:2px;">${completedModules} (${successRate})</div></div>
      </section>
      <h2 style="margin:0 0 8px; font-size:13px;">Detalle de avance por colaborador</h2>
    `;

    const table = document.querySelector('#admin-dashboard-view table').cloneNode(true);
    // Eliminar última columna de botón de acción en el clon para PDF limpio
    table.querySelectorAll('tr').forEach(tr => {
      if (tr.lastElementChild) tr.removeChild(tr.lastElementChild);
    });

    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '8.5px';

    table.querySelectorAll('th, td').forEach(cell => {
      cell.style.border = '1px solid #dbe3ee';
      cell.style.padding = '6px';
      cell.style.textAlign = 'left';
      cell.style.color = '#172033';
    });

    table.querySelectorAll('th').forEach(th => {
      th.style.backgroundColor = '#005e9c';
      th.style.color = '#ffffff';
      th.style.fontWeight = 'bold';
    });

    element.appendChild(table);
    element.insertAdjacentHTML('beforeend', `
      <footer style="display:flex; justify-content:space-between; margin-top:16px; padding-top:8px; border-top:1px solid #dbe3ee; color:#536175; font-size:8px;">
        <span>Uso interno - Evidencia de Concientización y Cumplimiento (SUDEBAN / PCI-DSS)</span>
        <span>Corporación Suiche 7B</span>
      </footer>
    `);

    const opt = {
      margin: 0.35,
      filename: `auditoria_suiche7b_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().catch(() => {
      this.showModalAlert({ title: 'Error de exportación', message: 'No fue posible generar el PDF.', type: 'danger' });
    }).finally(() => {
      if (originalBtn) {
        originalBtn.disabled = false;
        originalBtn.textContent = '📄 Reporte Ejecutivo PDF';
      }
    });
  }
}

let app = new AppController();
window.app = app;

window.addEventListener('DOMContentLoaded', () => {
  app.init();
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    app.handleRegistration(e);
  });
});
