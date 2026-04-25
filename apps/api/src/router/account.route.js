import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import AccountController from "../controller/account.controller.js";

const router = Router();

router
    .post('/', verifyToken, AccountController.create)
    .get('/', verifyToken, AccountController.getAll)
    .get('/:id', verifyToken, AccountController.getOne)


export default router;