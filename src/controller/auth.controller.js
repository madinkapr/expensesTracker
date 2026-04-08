import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../schema/user.schema.js';
import { successRes } from '../utils/success-response.js';
import {errorRes} from '../utils/error-response.js';

class authController {
    async register(req,res){
        try {
            const {name, email, password} = req.body;

            // 1. Parolni shifrlash
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // 2. Yangi foydalanuvchi
            const newUser = new User({
                name,
                email,
                passwordHash,
                defaultCurrency: 'UZS'
            });

            // 3. Saqlash
            await newUser.save();

            // 4. javob
            return successRes(res, {
                user: { id: newUser._id, name: newUser.name, email: newUser.email }
            }, 201)

        } catch (error) {
            return errorRes(res, error);
        }
    }

    async login(req,res){
        try {
            const {email, password} = req.body;

             // 1. Foydalanuvchini topish
             const user = await User.findOne({email});
             if(!user){
                return errorRes(res, { statusCode: 404, message: "User not found" })
             }

             // 2. Parolni tekshirish
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return errorRes(res, { statusCode: 401, message: "Invalid password" });
            }

            // 3. Token yaratish (JWT)
            const token = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' } // 1 kun amal qiladi
            );

            return successRes(res, {
                token,
                user: {id:user._id, name:user.name, email: user.email}
            })
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async logout(req,res){
        try {
            // Kelajakda shu yerda Session kolleksiyasidan 
            // foydalanuvchining tokenini o'chiramiz.
            // Hozircha shunchaki muvaffaqiyatli javob qaytaramiz.
            
            return successRes(res, { message: "Tizimdan chiqildi" });
        } catch (error) {
            return errorRes(res, error);
        }
    }
}

export default new authController()