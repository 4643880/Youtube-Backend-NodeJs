import { asyncHandler } from "../utils/async_handler.js";


const registerUser = asyncHandler(async (req, res, next) => {
    return res.status(200).json({       
        message: "pro developer",
    })
});

export {registerUser}