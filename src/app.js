import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import accountRouter from './routes/account-routes';
import menuRouter from './routes/menu-router';
import orderRouter from './routes/user-orders-router';
import balanceRouter from './routes/balance-router';
import authorization from './controllers/authorization';
import userRouter from './routes/user-router';
import logsRouter from './routes/logs-router';

dotenv.config();
const app = express();

mongoose.connect(process.env.CONNECTION_STRING);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE, PATCH');
  next();
});
app.options('*', (req, res) => res.end());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/account', accountRouter);
app.use('/api/', authorization.authorizeUser);
app.use('/api/menu', menuRouter);
app.use('/api/order', orderRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/user', userRouter);
app.use('/api/logs', logsRouter);

app.get('/swagger/:params*', (req, res) => res.sendFile(path.resolve(`${__dirname}/../${req.path}`)));

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${server.address().port}`);
});

