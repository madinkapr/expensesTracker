import Budget from '../schema/budget.schema.js';
import { successRes } from '../utils/success-response.js';
import { errorRes } from '../utils/error-response.js';
import { checkEntity } from '../utils/check-entity.js';

class BudgetController {
    async create(req, res) {
        try {
            const { month, year, totalBudget, spentAmount } = req.body;

            const newBudget = new Budget({
                userId: req.userId,
                month,
                year,
                totalBudget,
                spentAmount: spentAmount || 0
            })

            await newBudget.save();

            return successRes(res, newBudget, 201);
        } catch (error) {
            if (error.code === 11000 || (error.message && error.message.includes('E11000'))) {
                return errorRes(res, {
                    statusCode: 400,
                    message: "A budget already exists for this month. Please edit it."
                });
            }
            return errorRes(res, error);
        }
    }

    async getAll(req, res) {
        try {
            const budgets = await Budget.find({ userId: req.userId }).sort({ year: -1, month: -1 });
            return successRes(res, budgets);
        } catch (error) {
            return errorRes(res, error);

        }
    }

    async getOne(req, res) {
        try {
            const budget = await Budget.findOne({
                _id: req.params.id,
                userId: req.userId
            })

            if (checkEntity(budget, res)) return

            return successRes(res, budget)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const budget = await Budget.findOneAndUpdate(
                { _id: id, userId: req.userId }, updateData, { new: true, runValidators: true }
            )
            if (checkEntity(budget, res)) return
            return successRes(res, budget)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const deleteBudget = await Budget.findOneAndDelete({
                _id: id,
                userId: req.userId
            })

            if (checkEntity(deleteBudget, res)) return;
            return successRes(res, { message: "Budget deleted successfully" })
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async getCurrent(req, res) {
        try {
            const budget = await Budget.getCurrentBudget(req.userId);

            if (!budget) {
                return errorRes(res, {
                    statusCode: 404,
                    message: "No budget found for the current month."
                });
            }

            return successRes(res, budget);
        } catch (error) {
            return errorRes(res, error);
        }
    }
}

export default new BudgetController();
