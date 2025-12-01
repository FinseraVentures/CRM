# Dockerfile (runtime-only, use when dist/ already exists in repo)
FROM node:22-slim AS runtime

# Create app dir
WORKDIR /usr/src/app

# Copy only what is needed for runtime
COPY package.json package-lock.json ./
# install only production deps
RUN npm ci --omit=dev

# Copy built bundle and public assets
COPY dist ./dist
COPY public ./public
COPY .env.production .env 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use unhandled rejection strict for safety; adjust if bundle expects ESM/CommonJS
CMD ["node", "--unhandled-rejections=strict", "dist/bundle.js"]
