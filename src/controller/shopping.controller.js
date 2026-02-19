import Shopping from '../schema/shopping.schema.js';
import { errorRes } from '../utils/error-response.js';
import { successRes } from '../utils/success-response.js';
import { ApiError } from '../utils/ApiError.js';

class ShoppingController {
    async create(req, res) {
        try {
            const newShopping = await Shopping.create(req.body);
            return successRes(res, newShopping, 201)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async findAll(_req, res) {
        try {
            const shoppings = await Shopping.find();
            return successRes(res, shoppings)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async findById(req, res) {
        try {
            const id = req.params.id
            const shopping = await Shopping.findById(id);
            if (!shopping) {
                throw new ApiError(404, 'Item not found')
            }
            return successRes(res, shopping)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const updatedShopping = await Shopping.findByIdAndUpdate(id, req.body, { new: true })
            return successRes(res, updatedShopping)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async updateAll(req, res) {
        try {
            const id = req.params.id;
            const updatedShopping = await Shopping.findOneAndReplace({ _id: id }, req.body, { new: true })//yoki Shopping.findByIdAndUpdate(id,req.body,{ new: true, overwrite: true } )
            return successRes(res, updatedShopping)
        } catch (error) {
            return errorRes(res, error)

        }
    }

    async remove(req,res){
        try {
            const id = req.params.id;
            await Shopping.findByIdAndDelete(id);
            return successRes(res,{})
        } catch (error) {
            return errorRes(res, error)
        }
    }
}

export default new ShoppingController();