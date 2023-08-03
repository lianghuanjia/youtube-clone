# Stage 1: Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Production stage
from node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]