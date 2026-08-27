const ActiveDirectory = require('activedirectory2');
const { query, logAudit } = require('../config/db');

const loginWithAD = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos.' });
    }

    const config = {
      url: process.env.AD_URL,
      baseDN: process.env.AD_BASE_DN,
      domain: process.env.AD_DOMAIN,
      tlsOptions: { rejectUnauthorized: false }
    };

    if (!config.url || !config.baseDN) {
      console.warn('⚠️ Configuración de AD incompleta en el servidor.');
      return res.status(500).json({ success: false, message: 'El servidor no está configurado para conectarse al Active Directory.' });
    }

    // Formatear el usuario con el dominio si aplica
    let userPrincipalName = username;
    if (config.domain && !username.includes('@') && !username.includes('\\')) {
      // Intentar formato UPN si el dominio parece un FQDN (ej. suiche7b.local) o formato NetBIOS
      if (config.domain.includes('.')) {
        userPrincipalName = `${username}@${config.domain}`;
      } else {
        userPrincipalName = `${config.domain}\\${username}`;
      }
    }

    const ad = new ActiveDirectory(config);

    // 1. Autenticar al usuario
    ad.authenticate(userPrincipalName, password, async (err, auth) => {
      if (err) {
        console.error('AD Authentication error:', err.message || err);
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos, o problemas conectando al dominio.' });
      }

      if (auth) {
        // 2. Si autentica, buscar los detalles del usuario para extraer nombre y departamento
        // Para buscar usando las credenciales del propio usuario en lugar de un admin:
        const adUserBound = new ActiveDirectory({
            url: config.url,
            baseDN: config.baseDN,
            username: userPrincipalName,
            password: password,
            tlsOptions: config.tlsOptions
        });

        adUserBound.findUser(username, async (findErr, userProfile) => {
          if (findErr || !userProfile) {
            console.error('AD FindUser error:', findErr);
            return res.status(500).json({ success: false, message: 'Autenticado correctamente, pero no se pudo leer el perfil del usuario del AD.' });
          }

          const fullName = userProfile.displayName || userProfile.cn || username;
          const department = userProfile.department || 'Área General'; // Por defecto si no está definido en AD

          try {
            const clientIp = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';

            // --- Lógica de sincronización con PostgreSQL ---
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
               WHERE LOWER(u.full_name) = LOWER($1) AND u.department_id = $2`,
              [fullName, departmentId]
            );

            let dbUser;
            let isNew = false;

            if (userResult.rows.length > 0) {
              dbUser = userResult.rows[0];
              await query(
                'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1',
                [dbUser.id]
              );
            } else {
              const newUser = await query(
                `INSERT INTO users (full_name, department_id, total_score, correct_answers, total_questions)
                 VALUES ($1, $2, 0, 0, 0)
                 RETURNING id, full_name, department_id, total_score, correct_answers, total_questions, created_at`,
                [fullName, departmentId]
              );
              dbUser = newUser.rows[0];
              dbUser.department_name = department;
              isNew = true;

              const modules = ['phishing', 'pci', 'incident', 'password', 'usb'];
              for (const mod of modules) {
                await query(
                  `INSERT INTO module_progress (user_id, module_key, is_completed, score_earned, attempts)
                   VALUES ($1, $2, FALSE, 0, 0)
                   ON CONFLICT DO NOTHING`,
                  [dbUser.id, mod]
                );
              }
            }

            const progressResult = await query(
              'SELECT module_key, is_completed, score_earned, attempts FROM module_progress WHERE user_id = $1',
              [dbUser.id]
            );

            const completedModules = { phishing: false, pci: false, incident: false, password: false, usb: false };
            progressResult.rows.forEach(row => {
              completedModules[row.module_key] = row.is_completed;
            });

            await logAudit(
              dbUser.id,
              isNew ? 'USER_REGISTERED_AD' : 'USER_LOGIN_AD',
              { name: dbUser.full_name, department: dbUser.department_name, isNew, adUsername: username },
              clientIp,
              userAgent
            );

            return res.json({
              success: true,
              data: {
                id: dbUser.id,
                name: dbUser.full_name,
                department: dbUser.department_name,
                score: dbUser.total_score,
                correctAnswers: dbUser.correct_answers,
                totalQuestions: dbUser.total_questions,
                completedModules,
                isNew
              }
            });

          } catch (dbError) {
            console.error('Error DB durante sync de AD:', dbError);
            return res.status(500).json({ success: false, message: 'Error de servidor guardando el perfil del usuario.' });
          }
        });
      } else {
        return res.status(401).json({ success: false, message: 'Autenticación fallida.' });
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginWithAD
};

