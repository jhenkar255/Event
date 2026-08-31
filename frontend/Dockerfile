# ==========================================
# UTSAVMITRA FRONTEND DOCKERFILE
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json vite.config.ts ./
RUN npm ci

COPY index.html ./
COPY public/ ./public/
COPY src/ ./src/
COPY ../shared/ ../shared/

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

ARG VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

# Production Nginx Server
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
