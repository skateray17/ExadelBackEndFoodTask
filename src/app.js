import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import accountRouter from './routes/account-routes';
import menuRouter from './routes/menu-router';
import orderRouter from './routes/user-orders-router';
import authorization from './controllers/authorization';

dotenv.config();
const app = express();

mongoose.connect(process.env.CONNECTION_STRING);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/account', accountRouter);
app.use('/api/', authorization.authorizeUser);
app.use('/api/menu', menuRouter);
app.use('/api/order', orderRouter);

const server = app.listen(process.env.CONNECTION_PORT, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
