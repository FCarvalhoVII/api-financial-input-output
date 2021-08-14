import express from 'express';
import UserController from './controllers/UserController';
import TransactionController from './controllers/TransactionController';
import authMiddleware from './middlewares/auth';

const routes = express.Router();

routes.post('/api/v1/user', UserController.register);
routes.post('/api/v1/auth', UserController.authenticate);
routes.get('/api/v1/auth', UserController.authenticated);

routes.post('/api/v1/transaction', authMiddleware, TransactionController.create);
routes.put('/api/v1/transaction/:transactionId', authMiddleware, TransactionController.update);
routes.get('/api/v1/transaction/:transactionId', authMiddleware, TransactionController.listTransaction);
routes.get('/api/v1/transaction', authMiddleware, TransactionController.listUserTransactions);
routes.delete('/api/v1/transaction/:transactionId', authMiddleware, TransactionController.delete);

export default routes;