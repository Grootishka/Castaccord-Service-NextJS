FROM node:22.14.0 as builder

WORKDIR /usr/src/app

RUN apt-get update -yqq && apt-get -yqq install nasm

RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

COPY . .
RUN pnpm install --silent
ENV NODE_ENV=production
RUN pnpm run build


FROM node:22.14.0

ENV NODE_ENV=production
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

RUN npm i -g pm2 --silent

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/next.config.js ./next.config.js
COPY --from=builder /usr/src/app/next-i18next.config.js ./next-i18next.config.js
COPY --from=builder /usr/src/app/ecosystem.config.js ./ecosystem.config.js
COPY --from=builder /usr/src/app/.env.production ./.env.production

CMD ["pnpm", "run", "start:prod"]
