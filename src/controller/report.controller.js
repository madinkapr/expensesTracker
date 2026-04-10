import Transaction from '../schema/transaction.schema.js';
import { successRes } from '../utils/success-response.js';
import { errorRes } from '../utils/error-response.js';

class ReportController {
    async getMonthlyReport(req,res){
        try {
            // So'rovdan yil va oyni olish (agar yozilmasa hozirgi oyni oladi)
            const { year, month } = req.query;
            const y = year || new Date().getFullYear();
            const m = month || new Date().getMonth() + 1;

            const reportData = await Transaction.getCategoryBreakdown(req.userId, y, m);

            return successRes(res,{
                year:y,
                month:m,
                data: reportData
            })

        } catch (error) {
            return errorRes(res,error)
        }
    }
}

export default new ReportController();