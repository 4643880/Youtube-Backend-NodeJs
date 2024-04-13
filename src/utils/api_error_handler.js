
class ApiError extends Error {
    constructor(
        myStatusCode,
        myMessage = "Something Went Wrong",
        myErrors = [],
        myStackTrace = "",
    ){  
        super(myMessage)
        this.statusCode = myStatusCode
        this.message = myMessage
        this.stack = myStackTrace
        this.errors = myErrors 
    }
}

export {ApiError}

