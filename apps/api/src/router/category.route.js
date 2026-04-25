import { Router } from 'express';
import CategoryController from '../controller/category.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';


const router = Router();

router
    .post('/', verifyToken, CategoryController.create)
    .get('/', verifyToken, CategoryController.getAll)
    .get('/:id', verifyToken, CategoryController.getOne)
    .patch('/:id', verifyToken, CategoryController.update)
    .delete('/:id', verifyToken, CategoryController.delete)

export default router;