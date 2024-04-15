import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import appLogger from "./middlewares/app_logger.middleware.js";
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN_URL, credentials: true })); // will handle the requests from other origins
app.use(express.json({ limit: "16kb" })); // will parse in comming requests to json
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //allows for nested objects and arrays to be encoded
app.use(express.static("public"));
app.use(cookieParser());
app.use(appLogger)

// routes import

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);


app.get("/", (req, res) => {
    res.status(200).json({"status" : "success"});
})
export { app };
