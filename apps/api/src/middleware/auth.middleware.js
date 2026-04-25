import jwt from 'jsonwebtoken';
import { errorRes } from '../utils/error-response.js';

export const verifyToken = (req, res, next) => {
    try {
        // 1. Tokenni olish (Header dan: "Bearer <token>")
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorRes(res, { statusCode: 401, message: "Token topilmadi" });
        }

        const token = authHeader.split(' ')[1];

        // 2. Tokenni tekshirish (Secret key orqali)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Foydalanuvchi ID sini keyingi bosqichga o'tkazish
        req.userId = decoded.id;

        // 4. Yo'l ochish (Keyingi funksiyaga o'tish)
        next();

    } catch (error) {
        return errorRes(res, { statusCode: 401, message: 'Token yaroqsiz(invalid)' })
    }
}