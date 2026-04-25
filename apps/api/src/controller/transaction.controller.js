import Transaction from "../schema/transaction.schema.js";
import Account from "../schema/account.schema.js";
import { successRes } from "../utils/success-response.js";
import { errorRes } from "../utils/error-response.js";
import { checkEntity } from "../utils/check-entity.js";

class TransactionController {
    async create(req, res) {
        try {
            const { type, date, accountId, categoryId, description, tags, amount, note, cleared } = req.body;

            let finalAccountId = accountId;

            // Agar accountId berilmagan bo'lsa, avtomatik biriktiramiz
            if (!finalAccountId) {
                let account = await Account.findOne({ userId: req.userId });
                if (!account) {
                    // Agar umuman hisobi bo'lmasa, yangi yaratamiz
                    account = new Account({
                        userId: req.userId,
                        name: 'Asosiy hamyon',
                        type: 'cash',
                        initialBalance: 0,
                        currentBalance: 0
                    });
                    await account.save();
                }
                finalAccountId = account._id;
            }

            const newTransaction = new Transaction({
                userId: req.userId, 
                type,
                date,
                accountId: finalAccountId,
                categoryId,
                description,
                tags,
                amount,
                note,
                cleared: cleared || false
            });

            await newTransaction.save();
            return successRes(res, newTransaction, 201)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async getAll(req, res) {
        try {
            const transactions = await Transaction.find({ userId: req.userId }).populate('categoryId').sort({ date: -1 });

            return successRes(res, transactions)
        } catch (error) {
            return errorRes(res, error);
        }
    }

    async getOne(req, res) {
        try {
            const transaction = await Transaction.findOne({
                _id: req.params.id,
                userId: req.userId
            })

            if (checkEntity(transaction, res)) return;

            return successRes(res, transaction);
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params; //urldan id ni olamiz
            const updateData = req.body; //new data

            // Faqat o'z xarajatini tahrirlashi mumkin
            const transaction = await Transaction.findOneAndUpdate(
                { _id: id, userId: req.userId }, // Shart: ID shu bo'lsin VA User shu bo'lsin
                updateData,
                { new: true, runValidators: true } // Yangilangan qiymatni qaytarish va validatsiya
            )

            if (checkEntity(transaction, res)) return;

            return successRes(res, transaction);

        } catch (error) {
            return errorRes(res, error)
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const deleteTransaction = await Transaction.findOneAndDelete({
                _id: id,
                userId: req.userId
            });

            if (checkEntity(deleteTransaction, res)) return;

            return successRes(res, { message: 'Transaction deleted successfully.' })
        } catch (error) {
            return errorRes(res, error)
        }
    }

}

export default new TransactionController()