import mongoose from "mongoose";
const keys = require("./config/keys");
import { app } from "./app";
import { DatabaseConnectionError } from "./errors";

const start = async () => {
  if (process.env.NODE_ENV) {
    if (!process.env.mongoURI) {
      throw new Error("MONGOURI must be defined");
    }
    if (!process.env.jwtUserKey) {
      throw new Error("jwtUserKey must be defined");
    }
    if (!process.env.jwyUserExpireTime) {
      throw new Error("jwyUserExpireTime must be defined");
    }
  }
  try {
    console.log("CONNECTING TO MONGO DB");
    await mongoose.connect(keys.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("CONNECTED TO MONGODB");
  } catch (err) {
    console.error(err);
    throw new DatabaseConnectionError();
  }
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("SERVER STARTED ON PORT 5000");
  });
};

start();
