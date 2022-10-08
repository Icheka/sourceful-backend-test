FROM node:16

WORKDIR /usr/src/app/api

COPY package*.json ./

RUN npm i -d

COPY . .

EXPOSE 4000

CMD ["npm", "start"]