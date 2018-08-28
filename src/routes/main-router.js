import express from 'express';
import orderRouter from './user-orders-router';
import balanceRouter from './balance-router';
import authenticationRouter from './authentication-router';
import menuRouter from './menu-router';
import userRouter from './user-router';
import logsRouter from './logs-router';
import accountController from '../controllers/account-controller';
import vendorsRouter from './vendor-router';

const router = express.Router();


router.use('/api/account', authenticationRouter);
router.use('/api/user', userRouter);
router.use('/api/order', orderRouter);
router.use('/api/', accountController.checkLoginStatus);
router.use('/api/menu', menuRouter);
router.use('/api/balance', balanceRouter);
router.use('/api/logs', logsRouter);
router.use('/api/vendors', vendorsRouter);


module.exports = router;
