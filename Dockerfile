# syntax=docker/dockerfile:1
# ---- build: compila a SPA Vite ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime: nginx servindo dist/ ----
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/config.template.js /etc/mirante/config.template.js
COPY docker/entrypoint.sh /docker-entrypoint.d/40-mirante-config.sh
# nginx:alpine já roda /docker-entrypoint.d/*.sh antes de subir — o script
# gera /usr/share/nginx/html/config.js a partir das envs do tenant.
