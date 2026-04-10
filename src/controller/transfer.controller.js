import Transfer from '../schema/transfer.schema.js';
import Account from '../schema/account.schema.js';
import { errorRes } from '../utils/error-response.js';
import { successRes } from '../utils/success-response.js';
import { checkEntity } from '../utils/check-entity.js';

class TransferController {
    async create(req, res) {
        try {
            const { fromAccountId, toAccountId, amount, date, note } = req.body;
            // 1. Hisoblarni topish
            const fromAccount = await Account.findOne({ _id: fromAccountId, userId: req.userId });
            const toAccount = await Account.findOne({ _id: toAccountId, userId: req.userId });

            if (!fromAccount || !toAccount) {
                return errorRes(res, { statusCode: 404, message: 'Accounts not found' })
            }

            // 2. Balans yetarli ekanligini tekshirish
            if (fromAccount.currentBalance < amount) {
                return errorRes(res, { statusCode: 400, message: "Not enough funds" });
            }

            // 3. Balanslarni yangilash
            fromAccount.currentBalance -= amount;
            toAccount.currentBalance += amount;

            // 4. Hisoblarni saqlash
            await fromAccount.save();
            await toAccount.save();

            const newTransfer = new Transfer({
                userId: req.userId,
                fromAccountId,
                toAccountId,
                amount,
                date,
                note
            })

            await newTransfer.save();
            return successRes(res, newTransfer, 201)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async getAll(req, res) {
        try {
            const transfers = await Transfer.find({ userId: req.userId }).sort({ date: -1 });

            return successRes(res, transfers)
        } catch (error) {
            return errorRes(res, error);
        }
    }

    async getOne(req, res) {
        try {
            const transfer = await Transfer.findOne({
                _id: req.params.id,
                userId: req.userId
            })

            if (checkEntity(transfer, res)) return;

            return successRes(res, transfer);
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params; //urldan id ni olamiz
            const updateData = req.body; //new data

            // Faqat o'z xarajatini tahrirlashi mumkin
            const transfer = await Transfer.findOneAndUpdate(
                { _id: id, userId: req.userId }, // Shart: ID shu bo'lsin VA User shu bo'lsin
                updateData,
                { new: true, runValidators: true } // Yangilangan qiymatni qaytarish va validatsiya
            )

            if (checkEntity(transfer, res)) return;

            return successRes(res, transfer);

        } catch (error) {
            return errorRes(res, error)
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const deleteTransfer = await Transfer.findOneAndDelete({
                _id: id,
                userId: req.userId
            });

            if (checkEntity(deleteTransfer, res)) return;

            return successRes(res, { message: 'Transfer deleted successfully.' })
        } catch (error) {
            return errorRes(res, error)
        }
    }

}

export default new TransferController();