# ==========================================================
# Academia CiberSegura Suiche7B - Dockerfile de Producción
# Imagen optimizada y endurecida en Node.js Alpine
# ==========================================================

FROM node:20-alpine AS production

# 1. Definir directorio de trabajo
WORKDIR /usr/src/app

# 2. Instalar herramientas mínimas necesarias para healthcheck
RUN apk add --no-cache wget

# 3. Copiar manifiestos de paquetes
COPY package*.json ./

# 4. Instalar dependencias solo de producción
RUN npm install --omit=dev --no-audit --no-fund

# 5. Copiar código fuente de la aplicación
COPY . .

# 6. Asignar permisos seguros y usar usuario no root (Principio de Mínimo Privilegio)
RUN chown -R node:node /usr/src/app
USER node

# 7. Exponer puerto de la aplicación
EXPOSE 8085

# 8. Comprobación de salud — HTTP interno (Traefik gestiona TLS)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8085/health || exit 1

# 9. Comando de arranque
CMD ["node", "server/index.js"]
