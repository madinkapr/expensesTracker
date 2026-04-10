import Account from '../schema/account.schema.js';
import { successRes } from '../utils/success-response.js';
import { errorRes } from '../utils/error-response.js';
import { checkEntity } from '../utils/check-entity.js';

class AccountController{
    async create(req,res){
        try {
            const {name, type, currency, initialBalance, currentBalance} = req.body;

            const newAccount = new Account({
                userId: req.userId,
                name,
                type,
                currency,
                initialBalance,
                currentBalance
            })

            await newAccount.save()
            return successRes(res, newAccount, 201)
        } catch (error) {
            return errorRes(res, error)
        }
    }

    async getAll(req, res) {
            try {
                const accounts = await Account.find({ userId: req.userId }).sort({ createdAt: -1 });
    
                return successRes(res, accounts)
            } catch (error) {
                return errorRes(res, error);
            }
        }
    
        async getOne(req, res) {
            try {
                const account = await Account.findOne({
                    _id: req.params.id,
                    userId: req.userId
                })
    
                if (checkEntity(account, res)) return;
    
                return successRes(res, account);
            } catch (error) {
                return errorRes(res, error)
            }
        }
    
        
}

export default new AccountController();