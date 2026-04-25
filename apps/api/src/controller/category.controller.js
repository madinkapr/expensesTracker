import Category from "../schema/category.schema.js";
import { errorRes } from '../utils/error-response.js';
import { successRes } from '../utils/success-response.js';
import { checkEntity } from "../utils/check-entity.js";


class CategoryController {
    async create(req, res) {
            try {
                const { name, color, icon, type, isDefault } = req.body;
    
                const newCategory = new Category({
                    userId: req.userId, //Middleware dan olinadi!
                    name,
                    color,
                    icon,
                    type,
                    isDefault: false    
                });
    
                await newCategory.save();
                return successRes(res, newCategory, 201)
            } catch (error) {
                return errorRes(res, error)
            }
        }
    
        async getAll(req, res) {
            try {
                const categories = await Category.find({ userId: req.userId }).sort({ createdAt: -1 });
    
                return successRes(res, categories)
            } catch (error) {
                return errorRes(res, error);
            }
        }
    
        async getOne(req, res) {
            try {
                const category = await Category.findOne({
                    _id: req.params.id,
                    userId: req.userId
                })
    
                if (checkEntity(category, res)) return;
    
                return successRes(res, category);
            } catch (error) {
                return errorRes(res, error)
            }
        }
    
        async update(req, res) {
            try {
                const { id } = req.params; //urldan id ni olamiz
                const updateData = req.body; //new data
    
                // Faqat o'z xarajatini tahrirlashi mumkin
                const category = await Category.findOneAndUpdate(
                    { _id: id, userId: req.userId }, // Shart: ID shu bo'lsin VA User shu bo'lsin
                    updateData,
                    { new: true, runValidators: true } // Yangilangan qiymatni qaytarish va validatsiya
                )
    
                if (checkEntity(category, res)) return;
    
                return successRes(res, category);
    
            } catch (error) {
                return errorRes(res, error)
            }
        }
    
        async delete(req, res) {
            try {
                const { id } = req.params;
    
                const deleteCategory = await Category.findOneAndDelete({
                    _id: id,
                    userId: req.userId
                });
    
                if (checkEntity(deleteCategory, res)) return;
    
                return successRes(res, { message: 'Category deleted successfully.' })
            } catch (error) {
                return errorRes(res, error)
            }
        }
    

}

export default new CategoryController();