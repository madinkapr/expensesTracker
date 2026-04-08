import { Router } from 'express';
import authController from '../controller/auth.controller.js';
import userController from '../controller/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (Himoyasiz)
router
    .post('/register', authController.register)
    .post('/login', authController.login)
    .post('/logout', verifyToken, authController.logout)


// Protected route (Himoyalangan - TZ bo'yicha)
router
    .get('/me', verifyToken, userController.getMe);



export default router;