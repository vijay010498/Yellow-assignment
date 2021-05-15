import express, { text } from "express";
import { json } from "express";
import { testRouter } from "./routes/testRoute";

const app = express();
app.use(json());
app.set("trust proxy", true);
app.use(testRouter);
export { app };
