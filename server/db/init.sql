-- ==========================================================
-- Academia CiberSegura Suiche7B - Base de Datos Relacional
-- PostgreSQL Initialization & Schema Definition
-- ==========================================================

-- 1. Tabla de Departamentos Oficiales
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios Registrados
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50),
    full_name VARCHAR(120) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    total_score INTEGER DEFAULT 0 CHECK (total_score >= 0),
    correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
    total_questions INTEGER DEFAULT 0 CHECK (total_questions >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Progreso por Módulo Formativo
CREATE TABLE IF NOT EXISTS module_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL, -- 'phishing', 'pci', 'incident', 'password', 'usb'
    is_completed BOOLEAN DEFAULT FALSE,
    score_earned INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_module UNIQUE (user_id, module_key)
);

-- 4. Tabla de Auditoría y Trazabilidad de Eventos
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(60) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento y Búsqueda
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(total_score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_employee_id
    ON users (LOWER(employee_id))
    WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_module_progress_user ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action_type);

-- ==========================================================
-- Inserción de Departamentos Oficiales (Semillado Inicial)
-- ==========================================================
INSERT INTO departments (name) VALUES
    ('Junta Directiva'),
    ('Oficial de Cumplimiento'),
    ('Comité de Riesgos'),
    ('Presidencia Ejecutiva'),
    ('Auditoría de Sistemas'),
    ('Dirección Desarrollo Nuevos Negocios'),
    ('Dirección Tecnología'),
    ('Dirección Finanzas'),
    ('Gerencia Gestión Estratégica'),
    ('Gerencia Seguridad de la Información'),
    ('Gerencia Operaciones y Servicio al Cliente'),
    ('Gerencia Capital Humano')
ON CONFLICT (name) DO NOTHING;
