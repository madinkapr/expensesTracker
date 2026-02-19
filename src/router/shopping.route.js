import {Router} from 'express';
import controller from '../controller/shopping.controller.js';


const router = Router();

router
    .post('/', controller.create)
    .get('/', controller.findAll)
    .get('/:id', controller.findById)
    .patch('/:id', controller.update)
    .put('/:id', controller.updateAll)
    .delete('/:id', controller.remove)


export default router