import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error_handler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api_response_handler.js";
import fs from "fs";
import { DB_NAME } from "../constants.js";

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

export { registerUser };
