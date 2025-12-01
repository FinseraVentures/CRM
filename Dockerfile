FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
# copy public/ if present
COPY public ./public
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "--unhandled-rejections=strict", "dist/bundle.js"]
