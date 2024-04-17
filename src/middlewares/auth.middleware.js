import express from "express";
import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error_handler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); // removing bearer

    if (!token) {
      throw new ApiError(401, "Unauthorized Request...");
    }

    const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const newVerifiedUser = await User.findById(decodedInfo._id).select(
      "-password -refreshToken"
    );

    if (!newVerifiedUser) {
      throw new ApiError(401, "Invalid access token.");
    }

    req.newVerifiedUser = newVerifiedUser; // accessing this in the logout function
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Handle JWT token expiration error
      return res.status(401).json({
        success: false,
        message: "JWT token expired."
      });
    } else {
      // Handle other errors
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid access token."
      });
    }
  }
});

export default verifyJWT;
