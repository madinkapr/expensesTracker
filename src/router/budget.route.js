import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import BudgetController from "../controller/budget.controller.js";

const router = Router();

router
    .post('/', verifyToken, BudgetController.create)
    .get('/', verifyToken, BudgetController.getAll)
    .get('/current', verifyToken, BudgetController.getCurrent)
    .get('/:id', verifyToken, BudgetController.getOne)
    .patch('/:id', verifyToken, BudgetController.update)
    .delete('/:id', verifyToken, BudgetController.delete)


export default router;