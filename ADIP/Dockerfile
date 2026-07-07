# ADIP Frontend — React/Vite build served by nginx (production image).
# NOTE: Docker is NOT required for development (`npm run dev` works directly).
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Backend base URL is baked at build time; override with --build-arg.
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ARG VITE_DATA_SOURCE=mock
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DATA_SOURCE=$VITE_DATA_SOURCE
RUN npm run build

# --- Runtime: static assets via nginx ---
FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
