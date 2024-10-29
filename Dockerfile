FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install
RUN npm build

EXPOSE 4000

CMD ["node", "dist/index.js"]
