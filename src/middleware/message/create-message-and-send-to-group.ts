import { Request, Response, NextFunction } from "express";
import { Message } from "../../models/Message";
import { Group } from "../../models/Group";
import mongoose from "mongoose";

export const createMessageAndSendToGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { messageContent, groupId } = req.body;
  // @ts-ignore
  const { userId } = req;
  //first create message
  try {
    const message = Message.build({
      author: userId,
      content: messageContent,
    });
    await message.save();
    const messageId = message.toJSON().id;
    //send message to group
    await Group.updateOne(
      {
        _id: groupId,
      },
      {
        $push: {
          messages: {
            $each: [messageId],
            $position: 0,
          },
        },
      }
    );
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send(err);
    return;
  }
};
