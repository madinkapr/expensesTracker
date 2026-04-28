import Category from "../schema/category.schema.js";
import { errorRes } from '../utils/error-response.js';
import { successRes } from '../utils/success-response.js';
import { checkEntity } from "../utils/check-entity.js";


class CategoryController {
    async create(req, res) {
            try {
                const { name, color, icon, type, parentId } = req.body;
    
                const newCategory = new Category({
                    userId: req.userId,
                    name,
                    color,
                    icon,
                    type,
                    parentId: parentId || null,
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
                // Foydalanuvchining o'z kategoriyalari + Standart kategoriyalar
                let categories = await Category.find({ 
                    $or: [
                        { userId: req.userId },
                        { isDefault: true }
                    ]
                }).sort({ isDefault: -1, createdAt: -1 });

                // Agar hali hech narsa bo'lmasa, birinchi marta kirgan yuzer uchun seed qilish
                if (categories.length === 0) {
                    const defaults = [
                        { name: 'Oziq-ovqat', icon: '🍔', color: '#F44336', isDefault: true, type: 'expense' },
                        { name: 'Transport', icon: '🚗', color: '#2196F3', isDefault: true, type: 'expense' },
                        { name: 'Ijara', icon: '🏠', color: '#9C27B0', isDefault: true, type: 'expense' },
                        { name: 'Ko\'ngilochar', icon: '🎬', color: '#FFEB3B', isDefault: true, type: 'expense' },
                        { name: 'Maosh', icon: '💰', color: '#4CAF50', isDefault: true, type: 'income' },
                        { name: 'Boshqa', icon: '📦', color: '#9E9E9E', isDefault: true, type: 'expense' }
                    ];
                    await Category.insertMany(defaults);
                    categories = await Category.find({ isDefault: true });
                }
    
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