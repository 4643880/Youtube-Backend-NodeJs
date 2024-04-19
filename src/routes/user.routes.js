import express from "express";
import { registerUser , loginUser, logoutUser, validateAccessToken, getUserChannelProfile} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";


const router = express.Router();

// router.post("/register", registerUser);
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/validate_access_token").post(validateAccessToken);

router.route("/userChannelDetails/:username").get(verifyJWT, getUserChannelProfile);

export default router;
