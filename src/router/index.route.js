import {Router} from 'express';
import shoppingRouter from './shopping.route.js';
import shoppingCategory from './shoppingCategory.route.js';
import authRouter from './auth.route.js';


const router = Router();

router
    .use('/auth', authRouter)
    .use('/shopping', shoppingRouter)
    .use('/category', shoppingCategory)

export default router;