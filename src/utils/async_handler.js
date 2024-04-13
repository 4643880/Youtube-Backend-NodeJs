




// Created wrapper function that is passing a function in parameter and calling it in the try block and handling the exceptions
const asyncHandler = (fn) => {
  async (err, req, res, next) => {
    try {
      await fn(err, req, res, next);
    } catch (error) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
}; 
export { asyncHandler };

/* 
// Difficult Wrapper
const asyncHandler = (func) => {
    (err, req, res, next) => {
        Promise.resolve(func(err, req, res, next)).catch((error) => next(error));
    }
};
*/
