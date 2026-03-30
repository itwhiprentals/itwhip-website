FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

# .env.production is created by CI with all env vars
# Next.js automatically reads .env.production during build
RUN NODE_OPTIONS='--max-old-space-size=6144' npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# expo-server-sdk needs its package.json for user-agent string
COPY --from=builder /app/node_modules/expo-server-sdk/package.json ./node_modules/expo-server-sdk/package.json

EXPOSE 3000
CMD ["node", "server.js"]
