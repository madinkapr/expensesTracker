import {Router} from 'express';
import authRouter from './auth.route.js';
import transactionRouter from './transaction.route.js';
import accountRouter from './account.route.js';
import categoryRouter from './category.route.js';
import transferRouter from './transfer.route.js';
import budgetRouter from './budget.route.js';
import reportRouter from './report.route.js';
import userRouter from './user.route.js';

const router = Router();

router
    .use('/auth', authRouter)
    .use('/users', userRouter)
    .use('/transactions', transactionRouter)
    .use('/accounts', accountRouter)
    .use('/categories', categoryRouter)
    .use('/transfers', transferRouter)
    .use('/budgets', budgetRouter)
    .use('/reports', reportRouter)

export default router;