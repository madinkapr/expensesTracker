import { Router } from 'express';
import controller from '../controller/category.controller.js';


const router = Router();

router
    .post('/', controller.create)
    .get('/', controller.find)
    .get('/:id', controller.findById)
    .put('/:id', controller.updateAll)
    .patch('/:id', controller.update)
    .delete('/:id', controller.remove)

export default router;