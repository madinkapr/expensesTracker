import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import ReportController from '../controller/report.controller.js';

const router = Router();

// Grafika ma'lumotlarini olish
router.get('/monthly', verifyToken, ReportController.getMonthlyReport);

export default router;