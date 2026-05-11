import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Session from '../schema/session.schema.js';
import User from '../schema/user.schema.js';
import { successRes } from '../utils/success-response.js';
import { errorRes } from '../utils/error-response.js';
import { sendEmail } from '../utils/send-email.js';

class authController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

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

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Foydalanuvchini topish
            const user = await User.findOne({ email });
            if (!user) {
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

            // 4. Refresh token yasash va Sessiyani bazaga saqlash
            const refreshToken = crypto.randomBytes(40).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 kunga yaroqli

            const userAgent = req.headers['user-agent'] || 'Unknown';

            await Session.create({
                userId: user._id,
                refreshToken,
                userAgent,
                expiresAt
            });

            // 5. Javob qaytarish (javobga refreshToken ni ham qo'shib yuboramiz)
            // Cookie-larga yozish
            res.cookie('accessToken', token, {
                httpOnly: true,
                secure: false, // Prod-da true bo'ladi
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 kun
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 kun
            });
            return successRes(res, {
                user: { id: user._id, name: user.name, email: user.email }
            });
        } catch (error) {
            return errorRes(res, error);
        }
    }
    async logout(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return errorRes(res, { statusCode: 400, message: "Refresh token is required" });
            }

            if (refreshToken) {
                await Session.findOneAndDelete({ refreshToken });
            }

            // Cookie ni o'chirish (browserdan)}
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            return successRes(res, { message: "Logged out successfully" });
        } catch (error) {
            return errorRes(res, error);
        }
    }
    async forgetPassword(req, res) {
        try {
            const { email } = req.body;

            // 1. Foydalanuvchini email orqali topish
            const user = await User.findOne({ email });
            if (!user) {
                return errorRes(res, { statusCode: 404, message: "User not found" })
            }

            // 2. Vaqtinchalik token yaratish (crypto orqali)
            const resetToken = crypto.randomBytes(20).toString('hex');

            // 3. Token va uning amal qilish muddatini (masalan 15 daqiqa) bazaga saqlash
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 daqiqa
            await user.save();

            // 4. Reset linkni emailga yuborish
            const resetPasswordUrl = `http://localhost:5173/reset-password.html?token=${resetToken}`;
            const message = `
                <h1>ExpenseWise Password Reset</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetPasswordUrl}">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
            `;

            await sendEmail({
                email,
                subject: 'ExpenseWise Password Reset',
                message
            });

            return successRes(res, { message: 'Password reset link sent to your email' });
        } catch (error) {
            return errorRes(res, error);
        }
    }

    async resetPassword(req, res) {
        try {
            // URL dan (parametr orqali) tokenni olamiz, 
            // Body dan esa yangi parolni olamiz
            const { token } = req.params;
            const { newPassword } = req.body;
            // 1. Bazadan shunday tokeni bor va vaqti o'tmagan yuzerni qidiramiz
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return errorRes(res, { statusCode: 400, message: "Invalid or expired token" });
            }

            // 2. Yangi parolni shifrlaymiz (hash)
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(newPassword, salt);

            // 3. Tokenni olib tashlaymiz (tokenni faqat 1 marta ishlatish mumkin)
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            // 4. success javob qaytarish
            return successRes(res, { message: "Password reset successfully" });
        } catch (error) {
            return errorRes(res, error);
        }
    }
}

export default new authController()