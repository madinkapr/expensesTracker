import jwt from 'jsonwebtoken';
import { errorRes } from '../utils/error-response.js';

export const verifyToken = (req, res, next) => {
    try {
        // 1. Tokenni Cookie-dan olamiz
        const token = req.cookies.accessToken;

        if (!token) {
            return errorRes(res, { statusCode: 401, message: "Token topilmadi (Cookie-da)" });
        }

        // 2. Tokenni tekshirish
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Foydalanuvchi ID sini keyingi bosqichga o'tkazish
        req.userId = decoded.id;

        next();
    } catch (error) {
        return errorRes(res, { statusCode: 401, message: 'Token yaroqsiz yoki muddati o\'tgan' });
    }
}
