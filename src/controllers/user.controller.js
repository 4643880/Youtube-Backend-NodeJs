import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error_handler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
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
      (myfield) => myfield?.trim() === "" || myfield == null // after trim if any one is empty then it will return true, sum is just like map function on list
    )
  ) {
    console.log("reached here");
    throw new ApiError(400, "All fields are required.");
  }

  // check if the user already exists - email or username
  const existingUser = User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "User already exists with given email or username");
  }

  // check for images, check for avatar
  console.log(req?.files?.avatar[0]?.path);
  const avatarLocalPath = req?.files?.avatar[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage[0].path;
  if (avatarLocalPath === "") {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload them to cloudinary, avatar
  const myAvatar = await uploadOnCloudinary(avatarLocalPath);
  var myCoverImage = "";
  if (coverImageLocalPath != "") {
    myCoverImage = await uploadOnCloudinary(avatarLocalPath);
  }

  if (!myAvatar) {
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
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // return the response
  res.status(201).json(new ApiResponse(200, createdUser,"success", "User registered successfully."));

  // return res.status(200).json({
  //     message: "pro developer",
  // })
});

export { registerUser };
