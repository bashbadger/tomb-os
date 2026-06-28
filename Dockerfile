# Stage 1: Optimized Builder
FROM node:20-alpine AS builder
WORKDIR /app
# Leverage layer caching by copying package manifests first
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true

# Stage 2: Rootless Immutable Production Image
FROM nginx:1.27.1-alpine-slim
LABEL maintainer="Tomb OS Security Enclave"

# Remove default static assets to minimize attack surface
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from Stage 1 and custom hardened nginx configuration
COPY --from=builder /app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Establish standard configuration paths for unprivileged execution
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Modify file ownership to allow UID 101 (nginx) to read configuration
RUN chown -R 101:101 /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run /tmp

# Switch to the unprivileged Nginx user
USER 101

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
