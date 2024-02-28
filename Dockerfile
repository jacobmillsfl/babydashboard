FROM node:alpine as build-stage

WORKDIR /app

# Install dependencies before copying code changes
COPY package.json ./package.json
RUN npm install

COPY ./ /app/

# Uncomment to run tests on docker-build
#RUN CI=true npm test

RUN npm run build:vite

# Use nginx image for HTTP routing
FROM nginx:1.15

COPY --from=build-stage /app/src/out/ /usr/share/nginx/html

COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf