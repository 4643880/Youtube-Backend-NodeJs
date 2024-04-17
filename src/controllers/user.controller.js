import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error_handler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api_response_handler.js";
import fs from "fs";
import { DB_NAME } from "../constants.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res, next) => {
  var avatarLocalPath = "";
  var coverImageLocalPath = "";

  if (Array.isArray(req?.files?.avatar) && req?.files?.avatar.length > 0) {
    avatarLocalPath = req?.files?.avatar[0]?.path;
  }
  if (
    Array.isArray(req?.files?.coverImage) &&
    req?.files?.coverImage.length > 0
  ) {
    coverImageLocalPath = req?.files?.coverImage[0].path;
  }
  // get user details from frontend
  const {
    username,
    email,
    fullName,
    avatar,
    coverImage,
    password,
    refreshToken,
  } = req.body;
  console.log(`${username} ${email} ${fullName} ${password}`);

  // validation check - not empty
  if (
    [fullName, email, username, password].some(
      (myfield) => myfield == null || myfield.trim() === "" // after trim if any one is empty then it will return true, sum is just like map function on list
    )
  ) {
    if (avatarLocalPath != null && avatarLocalPath != "") {
      await fs.unlinkSync(avatarLocalPath);
    }
    if (coverImageLocalPath != null && coverImageLocalPath != "") {
      await fs.unlinkSync(coverImageLocalPath);
    }
    throw new ApiError(400, "All fields are required.");
  }

  // check if the user already exists - email or username
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    if (avatarLocalPath != null && avatarLocalPath != "") {
      await fs.unlinkSync(avatarLocalPath);
    }
    if (coverImageLocalPath != null && coverImageLocalPath != "") {
      await fs.unlinkSync(coverImageLocalPath);
    }
    throw new ApiError(409, "User already exists with given email or username");
  }

  // check for images, check for avatar
  // console.log(req?.files);
  // console.log("=====> " + req?.files?.avatar[0]?.path);
  if (avatarLocalPath === "" || avatarLocalPath == null) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary, avatar
  const myAvatar = await uploadOnCloudinary(avatarLocalPath);
  var myCoverImage = "";
  if (coverImageLocalPath != "" || myCoverImage != null) {
    myCoverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  if (myAvatar == null) {
    throw new ApiError(400, "Avatar file is necessary to upload on cloudinary");
  }

  // create user object - create entry in db
  const myUser = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: myAvatar.url,
    coverImage: myCoverImage?.url || "",
    password,
  });

  // remove password and refresh token field from the response
  const createdUser = await User.findById(myUser._id).select(
    "-password -refreshToken"
  ); // removing password & refreshToken

  // check for user creation
  if (!createdUser) {
    if (avatarLocalPath != null && avatarLocalPath != "") {
      await fs.unlinkSync(avatarLocalPath);
    }
    if (coverImageLocalPath != null && coverImageLocalPath != "") {
      await fs.unlinkSync(coverImageLocalPath);
    }
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return the response
  res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "success",
        "User registered successfully."
      )
    );
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Some went wrong while generating refresh & access tokens"
    );
  }
};

const loginUser = asyncHandler(async (req, res, next) => {
  // get user details from frontend
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // find the user
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // password check
  const isPasswordValid = await user.isMyPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // if password correct then generate access token & refresh token
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookie
  const options = {
    httpOnly: true,
    secure: true,
  }; // because i want to modify it from server, not from frontend
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, accessToken, refreshToken },
        "success",
        "User Loggedin successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  // alphaUser comming from the verifyJWT middleware

  await User.findByIdAndUpdate(
    req.newVerifiedUser._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true } // getting latest new value after updating
  );

  // cookie options
  const options = {
    httpOnly: true,
    secure: true,
  }; // because i want to modify it from server, not from frontend

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const validateAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedRefreshToken?._id);
    
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // send cookie
    const options = {
      httpOnly: true,
      secure: true,
    }; // because i want to modify it from server, not from frontend

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "success",
          "Access token refreshed successfully."
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, validateAccessToken };
