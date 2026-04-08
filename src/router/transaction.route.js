import { Router } from "express";
import transactionController from "../controller/transaction.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";


const router = Router();

router
    .post('/', verifyToken, transactionController.create)
    .get('/', verifyToken, transactionController.getAll)
    .patch('/:id', verifyToken, transactionController.update)
    .delete('/:id', verifyToken, transactionController.delete)

export default router;