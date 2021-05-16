import { Request, Response, NextFunction } from "express";
import { User } from "../../models/User";
import { BadRequestError } from "../bad-request-error";

export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //check if user exists
  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    console.error(err);
    res.status(403).send(err);
  }
  if (!user) {
    throw new BadRequestError("User Not Exists");
  }
  next();
};
