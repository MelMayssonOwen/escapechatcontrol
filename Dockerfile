FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY server ./server
COPY site ./site
EXPOSE 80
CMD ["node", "server/index.mjs"]
