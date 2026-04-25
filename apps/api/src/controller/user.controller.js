import User from '../schema/user.schema.js';
import { successRes } from '../utils/success-response.js';
import { errorRes } from '../utils/error-response.js';

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
}

export default new UserController();