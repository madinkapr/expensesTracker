import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    // 1. Transporter yaratish (pochta tashuvchi)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Email parametrlarini belgilash
    const mailOptions = {
        from: `ExpenseWise <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message // HTML formatda xat yuboramiz
    };

    // 3. Xatni jo'natish
    await transporter.sendMail(mailOptions);
};
