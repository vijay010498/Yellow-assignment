import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../errors";
import { Group } from "../../models/Group";

export const checkValidGroupId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //check if group exists
  const existingGroup = await Group.findById(req.body.groupId);
  if (!existingGroup) {
    throw new BadRequestError("Group doesn't Exists");
  }
  next();
};
