import Category from "../schema/category.schema.js";
import { ApiError } from "../utils/ApiError.js";
import { errorRes } from '../utils/error-response.js';
import { successRes } from '../utils/success-response.js';


class CategoryController {
    async create(req, res) {
        try {
            const { name } = req.body;
            const existsName = await Category.findOne({ name });
            if (existsName) {
                throw new ApiError(409, 'Category already exists')
            }
            const newCategory = await Category.create(req.body);
            return successRes(res, newCategory, 201);
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async find(_req, res) {
        try {
            const categories = await Category.find();
            return successRes(res, categories)
        } catch (error) {
            return errorRes(res, error)

        }
    }

    async findById(req, res) {
        try {
            const id = req.params.id;
            const category = await Category.findById(id);
            return successRes(res, category)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async updateAll(req, res) {
        try {
            const id = req.params.id;
            const updatedCategory = Category.findOneAndReplace({ _id: id }, req.body, { new: true })
            return successRes(res, updatedCategory)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            const updatedCategory = Category.findByIdAndUpdate(id, req.body, { new: true })
            return successRes(res, updatedCategory)
        } catch (error) {
            return errorRes(res, error)

        }

    }

    async remove(req, res) {
        try {
            const id = req.params.id;
            await Category.findByIdAndDelete(id)
            return successRes(res, {})
        } catch (error) {
            return errorRes(res, error)

        }
    }

}

export default new CategoryController();