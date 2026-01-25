FROM node:18.12.0-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18.12.0-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public

COPY --from=builder /usr/src/app/next.config.js ./
COPY --from=builder /usr/src/app/next-i18next.config.js ./
COPY --from=builder /usr/src/app/ecosystem.config.js ./
COPY --from=builder /usr/src/app/.env.production ./
COPY --from=builder /usr/src/app/package.json ./

RUN npm install pm2 -g -q

EXPOSE 3000

CMD ["npm", "run", "start:prod"]