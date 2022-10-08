import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { baseRouter } from './src/routes';

require('dotenv').config();

const server = express();
const port = process.env.PORT || 4000;

// middleware
server.use(
    cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true
    })
);
server.use(morgan('combined'));
server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use('/', baseRouter);

server.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});