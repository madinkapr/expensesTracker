import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import TransferController from '../controller/transfer.controller.js';

const router = Router()

router
    .post('/', verifyToken, TransferController.create)
    .get('/', verifyToken, TransferController.getAll)
    .get('/:id', verifyToken, TransferController.getOne)
    .patch('/:id', verifyToken, TransferController.update)
    .delete('/:id', verifyToken, TransferController.delete)

export default router
