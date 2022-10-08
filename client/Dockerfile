FROM node:16

WORKDIR /usr/src/app/client

COPY package*.json ./

RUN npm i -d

COPY . .

EXPOSE 3000

CMD ["npm", "start"]