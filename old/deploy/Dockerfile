FROM node:22-alpine3.21 AS builder

WORKDIR /app

COPY ./package*.json ./
COPY ./vite.config.ts ./
COPY ./tsconfig.json ./

RUN yarn install

COPY ./public/ ./public/
COPY . .

RUN yarn build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
