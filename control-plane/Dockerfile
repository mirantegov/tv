FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# tsconfig inclui src+scripts → o tsc emite em dist/src (rootDir comum).
CMD ["sh","-c","npm run migrate && npm run seed:admin && node dist/src/server.js"]
