FROM node:16

RUN mkdir /app
COPY server.js /app/
COPY package.json /app/
COPY package-lock.json /app/

WORKDIR /app
RUN npm install

CMD ["node", "/app/server.js"]

