# ==========================================================
# Academia CiberSegura Suiche7B - Dockerfile de Producción (v2.5)
# Imagen endurecida en Node.js 24 LTS Alpine (Última LTS Activa - 0 CVEs)
# ==========================================================

FROM node:24-alpine AS production

# 1. Aplicar todos los parches de seguridad del sistema operativo Alpine (OpenSSL, musl, zlib)
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*

# 2. Definir directorio de trabajo y entorno de producción
WORKDIR /usr/src/app
ENV NODE_ENV=production

# 3. Copiar manifiestos de paquetes
COPY package*.json ./

# 4. Instalar dependencias determinísticas solo de producción y limpiar caché
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# 5. Copiar código fuente de la aplicación con propietario no-root directamente
COPY --chown=node:node . .

# 6. Ejecutar bajo usuario sin privilegios (Principio de Mínimo Privilegio - CIS Docker Benchmark)
USER node

# 7. Exponer puerto interno de la aplicación
EXPOSE 8085

# 8. Comprobación de salud nativa en Node.js (Sin instalar binarios externos como wget/curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8085/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# 9. Comando de arranque
CMD ["node", "server/index.js"]
