FROM node:20.12.2 as builder
WORKDIR /project

COPY . .

RUN npm ci

RUN npm run build

FROM nginx:1.25.4

COPY --from=builder /project/build /usr/share/nginx/html
COPY --from=builder /project/server.conf /etc/nginx/conf.d/default.conf