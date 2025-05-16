FROM node:21.6-alpine3.18 AS backend-builder
WORKDIR /backend
COPY backend/package.json /backend/package.json
COPY backend/package-lock.json /backend/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
COPY backend /backend

FROM node:21.6-alpine3.18 AS client-builder
WORKDIR /ui
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="Envoy Gateway" \
    org.opencontainers.image.description="Manage Envoy Gateway directly from Docker Desktop" \
    org.opencontainers.image.vendor="Saptak Sen" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

COPY --from=backend-builder /backend /backend
COPY docker-compose.yaml .
COPY metadata.json .
COPY assets/icon.svg .
COPY --from=client-builder /ui/build ui
CMD ["node", "/backend/src/index.js"]
