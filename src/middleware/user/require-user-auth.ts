import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { User } from "../../models/User";
import jwt from "jsonwebtoken";
const keys = require("../../config/keys");

export const requireUserAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session!.JWT) {
    throw new NotAuthorizedError();
  } else {
    let email, userId;
    try {
      const payLoad = await jwt.verify(req.session!.JWT, keys.jwtUserKey);
      // @ts-ignore
      userId = payLoad.userId;
      // @ts-ignore
      email = payLoad.email;
    } catch (err) {
      console.error(err);
      throw new NotAuthorizedError();
    }
    //check existing user
    const existingUser = await User.findOne({
      email,
    });
    if (!existingUser) {
      throw new NotAuthorizedError();
    } else {
      // @ts-ignore
      req.userId = userId;
      // @ts-ignore
      req.email = email;
    }
    next();
  }
};
