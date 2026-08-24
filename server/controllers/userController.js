/**
 * Controlador de Usuarios
 * Maneja el registro, inicio de sesión seguro y consulta de perfil.
 */
const { query, logAudit } = require('../config/db');

// Obtener lista de departamentos
const getDepartments = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name FROM departments ORDER BY name ASC'
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Registrar o recuperar usuario
const registerUser = async (req, res, next) => {
  try {
    const { name, department, employeeId } = req.sanitizedBody;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // 1. Obtener o crear el departamento
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

    // 2. Buscar si el usuario ya existe por nombre y departamento (o crear nuevo)
    let userResult = await query(
      `SELECT u.id, u.employee_id, u.full_name, u.department_id, d.name AS department_name,
              u.total_score, u.correct_answers, u.total_questions, u.created_at
       FROM users u
       JOIN departments d ON u.department_id = d.id
       WHERE LOWER(u.full_name) = LOWER($1) AND u.department_id = $2`,
      [name, departmentId]
    );

    let user;
    let isNew = false;

    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
      // Actualizar última actividad
      await query(
        'UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } else {
      const newUser = await query(
        `INSERT INTO users (full_name, department_id, employee_id, total_score, correct_answers, total_questions)
         VALUES ($1, $2, $3, 0, 0, 0)
         RETURNING id, employee_id, full_name, department_id, total_score, correct_answers, total_questions, created_at`,
        [name, departmentId, employeeId || null]
      );
      user = newUser.rows[0];
      user.department_name = department;
      isNew = true;

      // Inicializar módulos de progreso
      const modules = ['phishing', 'pci', 'incident', 'password', 'usb'];
      for (const mod of modules) {
        await query(
          `INSERT INTO module_progress (user_id, module_key, is_completed, score_earned, attempts)
           VALUES ($1, $2, FALSE, 0, 0)
           ON CONFLICT DO NOTHING`,
          [user.id, mod]
        );
      }
    }

    // 3. Obtener el estado actual de los módulos
    const progressResult = await query(
      'SELECT module_key, is_completed, score_earned, attempts FROM module_progress WHERE user_id = $1',
      [user.id]
    );

    const completedModules = {
      phishing: false,
      pci: false,
      incident: false,
      password: false,
      usb: false
    };

    progressResult.rows.forEach(row => {
      completedModules[row.module_key] = row.is_completed;
    });

    // 4. Registro de auditoría
    await logAudit(
      user.id,
      isNew ? 'USER_REGISTERED' : 'USER_LOGIN',
      { name: user.full_name, department: user.department_name, isNew },
      clientIp,
      userAgent
    );

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.full_name,
        department: user.department_name,
        score: user.total_score,
        correctAnswers: user.correct_answers,
        totalQuestions: user.total_questions,
        completedModules,
        isNew
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil completo y progreso
const getUserProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'ID de usuario inválido.' });
    }

    const userResult = await query(
      `SELECT u.id, u.full_name, d.name AS department_name, u.total_score, u.correct_answers, u.total_questions
       FROM users u
       JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1 AND u.is_active = TRUE`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const user = userResult.rows[0];
    const progressResult = await query(
      'SELECT module_key, is_completed, score_earned, attempts FROM module_progress WHERE user_id = $1',
      [userId]
    );

    const completedModules = {};
    progressResult.rows.forEach(r => {
      completedModules[r.module_key] = r.is_completed;
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.full_name,
        department: user.department_name,
        score: user.total_score,
        correctAnswers: user.correct_answers,
        totalQuestions: user.total_questions,
        completedModules
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  registerUser,
  getUserProfile
};
