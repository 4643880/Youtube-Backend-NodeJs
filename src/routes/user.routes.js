import express from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = express.Router();

// router.post("/register", registerUser);
router.route("/register").post(registerUser);
// router.route("/login").get(registerUser);

export default router;
