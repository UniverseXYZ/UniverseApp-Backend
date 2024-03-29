FROM node:13.14-stretch AS development

RUN apt update
RUN apt install ffmpeg -y

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci
COPY . .
RUN npm run build

FROM node:13.14-stretch AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apt update
RUN apt install ffmpeg -y

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production

COPY . .
COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
