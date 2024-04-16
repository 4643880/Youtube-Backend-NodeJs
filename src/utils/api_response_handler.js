

class ApiResponse{
    constructor(
        statusCode,
        data,
        status = "success",
        message,
    ){
        this.statusCode = statusCode
        this.data = data
        this.status = status
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}