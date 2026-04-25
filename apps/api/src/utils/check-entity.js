import { errorRes } from "./error-response.js";

export function checkEntity(entity, res){
    if(!entity){
        return errorRes(res, {statusCode:404, 
            message: ' Transaction not found or does not belong to you.'})
    }
    return null;
}