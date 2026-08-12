# Minimal image for the companion bot — a long-lived process, no HTTP server,
# just an outbound gateway connection to Discord. Works on Fly.io, any VPS with
# Docker (e.g. an Oracle Cloud Always Free instance), or Railway's Docker deploy.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

CMD ["node", "src/index.js"]
