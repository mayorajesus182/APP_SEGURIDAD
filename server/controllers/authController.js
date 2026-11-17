const ActiveDirectory = require('activedirectory2');
const { query, logAudit, ALL_MODULES } = require('../config/db');
const { signToken } = require('../config/jwt');

// Auxiliar para obtener la configuración global de fases de la Academia
const getAcademyConfigFromDB = async (fallback = null) => {
  try {
    const res = await query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'academy_config'"
    );
    if (res.rows.length > 0 && res.rows[0].setting_value) {
      return res.rows[0].setting_value;
    }
  } catch (e) {
    if (fallback) return fallback;
  }
  return fallback || {
    activePhaseMode: 'both',
    campaignName: 'Programa Anual de Concientización 2026',
    requirePhase1ForPhase2: false
  };
};

// Respaldo en memoria para usuarios cuando se ejecuta fuera de Docker sin PostgreSQL
const localMemoryUsers = new Map();

const buildFallbackProfile = async ({ username, fullName, department }) => {
  const key = username.toLowerCase();
  if (!localMemoryUsers.has(key)) {
    const completedModules = {};
    const moduleScores = {};
    ALL_MODULES.forEach(m => {
      completedModules[m] = false;
      moduleScores[m] = 0;
    });
    localMemoryUsers.set(key, {
      id: localMemoryUsers.size + 1,
      name: fullName || username,
      department: department || 'Corporación Suiche 7B',
      score: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      completedModules,
      moduleScores,
      certificates: {},
      isNew: true
    });
  }
  const u = localMemoryUsers.get(key);
  const academyConfig = await getAcademyConfigFromDB();
  const token = signToken({
    id: u.id,
    username,
    name: u.name,
    department: u.department,
    isAdmin: false
  });
  return { ...u, academyConfig, token };
};

// Auxiliar para sincronizar perfil de colaborador con PostgreSQL y retornar estado completo
const syncUserAndBuildProfile = async ({ username, fullName, department, clientIp, userAgent, authSource = 'AD' }) => {
  try {
    let deptResult = await query(
      'SELECT id FROM departments WHERE LOWER(name) = LOWER($1)',
      [department]
    );

    let departmentId;
    if (deptResult.rows.length === 0) {
      const newDept = await query(
        'INSERT INTO departments (name) VALUES ($1) RETURNING id',
        [department]
      );
      departmentId = newDept.rows[0].id;
    } else {
      departmentId = deptResult.rows[0].id;
    }

    let userResult = await query(
      `SELECT u.id, u.full_name, u.department_id, d.name AS department_name,
              u.total_score, u.correct_answers, u.total_questions, u.created_at
       FROM users u
       JOIN departments d ON u.department_id = d.id
       WHERE LOWER(u.employee_id) = LOWER($1)`,
      [username]
    );

    let dbUser;
    let isNew = false;

    if (userResult.rows.length > 0) {
      dbUser = userResult.rows[0];
      await query(
        `UPDATE users
         SET full_name = $1, department_id = $2, last_activity = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [fullName, departmentId, dbUser.id]
      );
      dbUser.department_name = department;
    } else {
      const newUser = await query(
        `INSERT INTO users (employee_id, full_name, department_id, total_score, correct_answers, total_questions)
         VALUES ($1, $2, $3, 0, 0, 0)
         RETURNING id, full_name, department_id, total_score, correct_answers, total_questions, created_at`,
        [username, fullName, departmentId]
      );
      dbUser = newUser.rows[0];
      dbUser.department_name = department;
      isNew = true;
    }

    // Asegurar que los 10 módulos (Fase 1 y Fase 2) existan en module_progress
    for (const mod of ALL_MODULES) {
      await query(
        `INSERT INTO module_progress (user_id, module_key, is_completed, score_earned, attempts)
         VALUES ($1, $2, FALSE, 0, 0)
         ON CONFLICT (user_id, module_key) DO NOTHING`,
        [dbUser.id, mod]
      );
    }

    const progressResult = await query(
      'SELECT module_key, is_completed, score_earned, attempts FROM module_progress WHERE user_id = $1',
      [dbUser.id]
    );

    const completedModules = {};
    const moduleScores = {};
    ALL_MODULES.forEach(m => {
      completedModules[m] = false;
      moduleScores[m] = 0;
    });

    progressResult.rows.forEach(row => {
      completedModules[row.module_key] = Boolean(row.is_completed);
      moduleScores[row.module_key] = parseInt(row.score_earned || 0, 10);
    });

    let certificates = {};
    try {
      const certRes = await query(
        'SELECT phase, certificate_code, score_at_issue, issued_at FROM certificates WHERE user_id = $1',
        [dbUser.id]
      );
      certRes.rows.forEach(c => {
        certificates[c.phase] = {
          code: c.certificate_code,
          score: c.score_at_issue,
          issuedAt: c.issued_at
        };
      });
    } catch (e) {
      // ignore
    }

    const academyConfig = await getAcademyConfigFromDB();

    await logAudit(
      dbUser.id,
      isNew ? `USER_REGISTERED_${authSource}` : `USER_LOGIN_${authSource}`,
      { name: dbUser.full_name, department: dbUser.department_name, isNew, username },
      clientIp,
      userAgent
    );

    const token = signToken({
      id: dbUser.id,
      username,
      name: dbUser.full_name,
      department: dbUser.department_name,
      isAdmin: false
    });

    return {
      id: dbUser.id,
      name: dbUser.full_name,
      department: dbUser.department_name,
      score: dbUser.total_score,
      correctAnswers: dbUser.correct_answers,
      totalQuestions: dbUser.total_questions,
      completedModules,
      moduleScores,
      certificates,
      academyConfig,
      token,
      isNew
    };
  } catch (dbErr) {
    console.warn('⚡ PostgreSQL no disponible localmente, usando sesión en memoria para:', username);
    return buildFallbackProfile({ username, fullName, department });
  }
};

const loginWithAD = async (req, res, next) => {
  let responded = false;
  const sendOnce = (statusCode, payload) => {
    if (responded || res.headersSent) return;
    responded = true;
    return res.status(statusCode).json(payload);
  };

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendOnce(400, { success: false, message: 'Usuario y contraseña son requeridos.' });
    }

    const clientIp = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    // --- 1. Verificación de Administrador Local ---
    if (
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const academyConfig = await getAcademyConfigFromDB();
      const adminJwt = signToken({
        id: 'admin',
        username: process.env.ADMIN_USERNAME,
        name: 'Administrador de Seguridad',
        isAdmin: true
      });

      await logAudit(null, 'ADMIN_LOGIN', { username }, clientIp, userAgent);

      return sendOnce(200, {
        success: true,
        data: {
          id: 'admin',
          name: 'Administrador de Seguridad',
          department: 'Gerencia Seguridad de la Información',
          isAdmin: true,
          token: adminJwt,
          academyConfig
        }
      });
    }

    // --- 2. Configuración Active Directory ---
    const config = {
      url: process.env.AD_URL,
      baseDN: process.env.AD_BASE_DN,
      domain: process.env.AD_DOMAIN,
      tlsOptions: {
        rejectUnauthorized: process.env.AD_TLS_REJECT_UNAUTHORIZED === 'true'
      },
      attributes: {
        user: [
          'dn', 'distinguishedName', 'userPrincipalName', 'sAMAccountName',
          'displayName', 'department', 'physicalDeliveryOfficeName', 'cn'
        ]
      }
    };

    if (!config.url || !config.baseDN) {
      console.warn('⚠️ Configuración de AD incompleta en el servidor.');
      return sendOnce(500, {
        success: false,
        message: 'El servidor no está configurado para conectarse al Active Directory.'
      });
    }

    let userPrincipalName = username;
    if (config.domain && !username.includes('@') && !username.includes('\\')) {
      if (config.domain.includes('.')) {
        userPrincipalName = `${username}@${config.domain}`;
      } else {
        userPrincipalName = `${config.domain}\\${username}`;
      }
    }

    const ad = new ActiveDirectory(config);

    // Autenticar al usuario contra Active Directory
    ad.authenticate(userPrincipalName, password, async (err, auth) => {
      if (responded) return;

      if (err) {
        console.error('AD Authentication error:', err.message || err);
        return sendOnce(401, {
          success: false,
          message: 'Usuario o contraseña incorrectos, o problemas conectando al dominio.'
        });
      }

      if (auth) {
        const adUserBound = new ActiveDirectory({
          url: config.url,
          baseDN: config.baseDN,
          username: userPrincipalName,
          password: password,
          tlsOptions: config.tlsOptions,
          attributes: config.attributes
        });

        let findHandled = false;
        adUserBound.findUser(username, async (findErr, userProfile) => {
          if (findHandled || responded) return;
          findHandled = true;

          // Si LDAPS cierra el socket tras autenticar (ECONNRESET), usar el username autenticado sin fallar
          const fullName = (userProfile && (userProfile.displayName || userProfile.cn)) || username;
          const department = (userProfile && (userProfile.physicalDeliveryOfficeName || userProfile.department)) || 'Área General';

          try {
            const profileData = await syncUserAndBuildProfile({
              username,
              fullName,
              department,
              clientIp,
              userAgent,
              authSource: 'AD'
            });

            return sendOnce(200, {
              success: true,
              data: profileData
            });
          } catch (dbError) {
            console.error('Error sincronizando perfil:', dbError);
            return sendOnce(500, {
              success: false,
              message: 'Error de servidor guardando el perfil del usuario.'
            });
          }
        });
      } else {
        return sendOnce(401, { success: false, message: 'Autenticación fallida.' });
      }
    });
  } catch (error) {
    if (!responded && !res.headersSent) {
      next(error);
    }
  }
};

module.exports = {
  loginWithAD,
  getAcademyConfigFromDB,
  syncUserAndBuildProfile
};
