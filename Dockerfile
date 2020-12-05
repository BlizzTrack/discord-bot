# Stage 1 - Setup
FROM node:14-alpine as builder

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

# Stage 2 - Run
FROM node:14-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /usr/src/app/dist ./dist

CMD npm start