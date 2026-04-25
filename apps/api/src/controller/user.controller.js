import User from '../schema/user.schema.js';
import { successRes } from '../utils/success-response.js';
import { errorRes } from '../utils/error-response.js';
import bcrypt from 'bcrypt';

class UserController {
    async getMe(req, res) {
        try {
            const user = await User.findById(req.userId).select('-passwordHash');

            if (!user) {
                return errorRes(res, { statusCode: 404, message: "User topilmadi" });
            }

            return successRes(res, user);
        } catch (error) {
            return errorRes(res, error);
        }
    }

    async updateMe(req, res) {
        try {
            const { name, email, password } = req.body;
            const updateData = {};

            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.passwordHash = await bcrypt.hash(password, salt);
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.userId, 
                updateData, 
                { new: true, runValidators: true }
            ).select('-passwordHash');

            return successRes(res, updatedUser, 200, "Profil yangilandi");
        } catch (error) {
            return errorRes(res, error);
        }
    }
}

export default new UserController();