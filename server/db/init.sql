-- ==========================================================
-- Academia CiberSegura Suiche7B - Base de Datos Relacional
-- PostgreSQL Initialization & Schema Definition (Fase 1 + Fase 2)
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

-- 3. Tabla de Progreso por Módulo Formativo (Soporta Fase 1 y Fase 2)
CREATE TABLE IF NOT EXISTS module_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_key VARCHAR(50) NOT NULL,
    -- Fase 1: 'phishing', 'pci', 'incident', 'password', 'usb'
    -- Fase 2: 'ai_sec', 'pci_dss', 'quishing_mfa', 'bec_fraud', 'remote_vpn'
    is_completed BOOLEAN DEFAULT FALSE,
    score_earned INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_module UNIQUE (user_id, module_key)
);

-- 4. Tabla de Configuración Global del Sistema (Control de Fases y Campañas)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(60) PRIMARY KEY,
    setting_value JSONB NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Certificados Emitidos y Verificables (Auditoría SUDEBAN / Cumplimiento)
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phase VARCHAR(20) NOT NULL, -- 'phase1', 'phase2', 'master'
    certificate_code VARCHAR(40) UNIQUE NOT NULL,
    score_at_issue INTEGER DEFAULT 0,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_phase_cert UNIQUE (user_id, phase)
);

-- 6. Tabla de Auditoría y Trazabilidad de Eventos
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
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);

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

-- ==========================================================
-- Configuración Inicial por Defecto (Fases Activas y Campaña)
-- ==========================================================
INSERT INTO system_settings (setting_key, setting_value, updated_by)
VALUES (
    'academy_config',
    '{"activePhaseMode": "phase2", "campaignName": "Programa Anual de Concientización 2026", "requirePhase1ForPhase2": false}'::jsonb,
    'system'
)
ON CONFLICT (setting_key) DO NOTHING;
