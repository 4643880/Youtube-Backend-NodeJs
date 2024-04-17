import express from "express";
import { asyncHandler } from "../utils/async_handler";
import { ApiError } from "../utils/api_error_handler";
import jwt from "jsonwebtoken";
import { User } from '../models/user.models';

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req?.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); // removing bearer

    if(!token){
        throw new ApiError(401, "Unauthorized Request...");
    }

    const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET );

    const newVerifiedUser = await User.findById(decodedInfo._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(401, "Invalid access token.");
    }

    req.alphaUser = newVerifiedUser;
    next();
});
