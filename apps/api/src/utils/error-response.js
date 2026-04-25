export function errorRes(res,error){
    const errorMessage = {
        statusCode: error?.statusCode ? error?.statusCode :500,
        message: error?.message ? error?.message : 'Internal server error'
    }
    return res.status(errorMessage.statusCode).json(errorMessage)
}