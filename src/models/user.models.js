import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt, { genSalt } from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Enabling the searching in the users
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true, // Enabling the searching in the users
    },
    avatar: {
      type: String, // coudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Using pre hook of the mongoose that will call before saving, only if the password is modified
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } else {
    return next();
  }
});

// Designing Custom Method and injecting it to compare password
userSchema.methods.isMyPasswordCorrect = async function (
  passwordPassingInParameter
) {
  let result = await bcrypt.compare(passwordPassingInParameter, this.password);
  return result;
};

// Designing Custom Methods to generate Access Token
userSchema.methods.generateAccessToken = function () {
  var accessToken = jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  return accessToken;
};

// Designing Custom Methods to generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  var refreshToken = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );

  return refreshToken;
};

export const User = mongoose.model("User", userSchema);
