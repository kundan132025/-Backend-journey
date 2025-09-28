class ApiError extends Error{
    constructor(
        statusCode,
        massage = "Somthing Went Wrong",
        error,
        stack
    ){
        super(massage)
        this.statusCode = statusCode,
        this.data = null,
        this.massage = massage,
        this.success = false,
        this.error = error

        if(stack){
            this.stack =stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}