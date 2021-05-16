import express, { text } from "express";
import "express-async-errors";
import { json } from "express";
import cookieParser from "cookie-parser";
import { testRouter } from "./routes/testRoute";
import { errorhandler, NotFoundError } from "./errors";
import cookieSession from "cookie-session";

//all routes
import { userAuthRoutes } from "./routes/User/auth/authRoutes";
import { userMessageRoutes } from "./routes/groups/groupMessageRoutes";

const app = express();
app.use(json());
app.use(cookieParser());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === "production",
  })
);
app.set("trust proxy", true);

app.use(userAuthRoutes);
app.use(userMessageRoutes);
app.use(testRouter);
app.use(errorhandler);
app.all("*", async (req, res) => {
  throw new NotFoundError();
});
export { app };
