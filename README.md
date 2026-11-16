# 🛡️ Academia CiberSegura Corporación Suiche 7B (v2.5 — Fase 1 + Fase 2 Contenerizada)

Plataforma interactiva de entrenamiento, simulación de ataques y concienciación en ciberseguridad para el personal de **Corporación Suiche 7B**, respaldada por una arquitectura empresarial en **Docker**, **Node.js (Express)**, **Active Directory (LDAPS)** y **PostgreSQL 16**.

---

## 🚀 Inicio Rápido con Docker Compose

Para levantar o actualizar toda la infraestructura (servidor de aplicaciones + base de datos PostgreSQL con auto-migración de esquema):

```bash
docker compose up -d --build
```

Para detener los contenedores:
```bash
docker compose down
```

---

## ⚙️ Novedades de la Fase 2 (v2.5)

### 1. Control Maestro de Fases por el Administrador (`Fase 1` | `Fase 2` | `Ambas`)
Desde el **Centro de Control y Auditoría CISO (Admin)**, el administrador puede activar en tiempo real y con persistencia en PostgreSQL (`system_settings`):
- **🛡️ Solo Fase 1 (Básico - 5 Módulos)**: Phishing Detective, Oficina Segura (Clean Desk), Alerta de Vishing y SMS, Simulador de Fuerza Bruta y Trampas con USB.
- **🚀 Solo Fase 2 (Avanzado Transaccional - 5 Módulos)**:
  1. **IA Generativa y Fuga DLP (`ai_sec`)**: Auditoría de prompts frente a Shadow AI (prevención de fuga de tramas ISO-8583, PAN, credenciales y actas de Comité de Riesgos).
  2. **PCI-DSS 4.0 Transaccional (`pci_dss`)**: Protección de datos de tarjetahabientes (enmascaramiento de PAN, prohibición de almacenamiento de CVV2/Track 2, uso de HSM para PIN Block y segregación de ambientes QA).
  3. **Quishing QR y Fatiga de MFA (`quishing_mfa`)**: Defensa del segundo factor de autenticación (2FA) frente a ataques de *Push Bombing* nocturno y códigos QR maliciosos.
  4. **Fraude Ejecutivo BEC / Whaling (`bec_fraud`)**: Prevención de suplantación de Alta Gerencia, fraude en cambio de cuentas bancarias de proveedores y falsas inspecciones de SUDEBAN.
  5. **Teletrabajo Seguro, VPN y Redes Wi-Fi (`remote_vpn`)**: Detección de redes gemelas maliciosas (*Evil Twin*), túneles VPN corporativos y prevención de exfiltración en nubes personales.
- **⚡ Ambas Fases Activas (10 Módulos)**: Habilita simultáneamente Fase 1 y Fase 2 (con opción configurable para exigir completar Fase 1 antes de desbloquear Fase 2).

### 2. Blindaje Técnico, Anti-Farming y Certificados Verificables
- **Autenticación con Tokens JWT Firmados (HMAC-SHA256)**: Sesiones firmadas en [server/config/jwt.js](file:///c:/Users/jmayora/OneDrive%20-%20Suiche%207B/Documentos/APP_SEGURIDAD/server/config/jwt.js) que impiden la manipulación de `userId` en los endpoints de progreso.
- **Protección Anti-Farming de Puntos**: Tope máximo por módulo en [server/controllers/progressController.js](file:///c:/Users/jmayora/OneDrive%20-%20Suiche%207B/Documentos/APP_SEGURIDAD/server/controllers/progressController.js) y cálculo exacto de `total_score` mediante agregación SQL de `module_progress`, permitiendo repetir módulos para practicar sin distorsionar las métricas de auditoría.
- **Certificados Registrados en Base de Datos (`certificates`)**: Emisión automática de certificados diferenciados para **Fase 1** (`S7B-F1-...`) y **Fase 2** (`S7B-F2-...`) con verificador de autenticidad integrado en el panel de Auditoría.
- **Gamificación 2.0Conectada**: Ranking interdepartamental en vivo, sistema de insignias desbloqueables, sintetizador `Web Audio API` activable en cabecera y **Personalizador de Escenarios** sincronizado con PostgreSQL.

---

## 🗄️ Base de Datos y Persistencia (PostgreSQL)

El esquema se inicializa en `server/db/init.sql` y cuenta además con **auto-migración automática (`ensureSchema()`)** al iniciar el servidor Node.js para actualizar contenedores existentes sin pérdida de datos:

| Tabla | Propósito |
|---|---|
| `departments` | Catálogo oficial de departamentos y gerencias de La Corporación Suiche 7B. |
| `users` | Registro de colaboradores sincronizados con Active Directory, puntaje y precisión. |
| `module_progress` | Trazabilidad de los 10 módulos (5 de Fase 1 + 5 de Fase 2) con topes anti-farming. |
| `system_settings` | Configuración global persistente (modo de fases activas, campaña y plantillas de escenarios). |
| `certificates` | Registro oficial e inmutable de certificados emitidos (`phase1`, `phase2`, `master`). |
| `audit_logs` | Registro inmutable de eventos de seguridad (login AD/Admin, cambio de fases, completado de módulos, IP y User-Agent). |

---

## 📡 Endpoints de la API REST (`/api/v1`)

- `GET /health` : Verificación de estado del servidor y conexión a PostgreSQL.
- `POST /api/v1/auth/login` : Inicio de sesión con Active Directory (LDAPS) o Administrador y emisión de JWT.
- `GET /api/v1/users/:id` : Perfil completo del colaborador, progreso en los 10 módulos y certificados.
- `POST /api/v1/progress/update` : Actualización protegida de puntos y módulos completados.
- `GET /api/v1/settings/phase` / `POST /api/v1/settings/phase` : Consulta y activación dinámica de `phase1`, `phase2` o `both`.
- `GET /api/v1/settings/scenarios` / `POST /api/v1/settings/scenarios` : Sincronización de escenarios personalizados en PostgreSQL.
- `GET /api/v1/certificates/verify/:code` : Verificación oficial de códigos de certificados emitidos.
- `GET /api/v1/stats/leaderboard` : Ranking interdepartamental en tiempo real.
- `GET /api/v1/stats/summary` & `GET /api/v1/stats/users` : Métricas ejecutivas y auditoría detallada con desglose Fase 1 y Fase 2.
