import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import passport from 'passport';

import MainRouter from './routes/main-router';
import menuRouter from './routes/menu-router';
import orderRouter from './routes/user-orders-router';
import balanceRouter from './routes/balance-router';
import authorization from './controllers/authorization';
import userRouter from './routes/user-router';
import logsRouter from './routes/logs-router';
import test from './routes/authentication-router';


dotenv.config();
const app = express();

mongoose.connect(process.env.CONNECTION_STRING);

app.use(passport.initialize());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, PATCH');
  next();
});
app.options('*', (req, res) => res.end());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', MainRouter);

app.get('/swagger/:params*', (req, res) => res.sendFile(path.resolve(`${__dirname}/../${req.path}`)));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

