FROM node:22.14.0 as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update -yqq \
    && apt-get -yqq install nasm

RUN npm install -g pnpm@9.14.4 --silent

COPY . .

RUN pnpm install --silent

ENV NODE_ENV=production

RUN pnpm run build

FROM node:22.14.0

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder ["/usr/src/app/next.config.js", "/usr/src/app/next-i18next.config.js", "/usr/src/app/ecosystem.config.js", "/usr/src/app/.env.${NODE_ENV}", "/usr/src/app/package.json", "./"]

RUN pnpm install pm2 -g -q

CMD ["pnpm", "run", "start:prod"]