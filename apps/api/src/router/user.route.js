import { Router } from 'express';
import userController from '../controller/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', verifyToken, userController.getMe);
router.patch('/me', verifyToken, userController.updateMe);

export default router;
