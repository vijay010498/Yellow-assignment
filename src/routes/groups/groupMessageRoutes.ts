// @ts-nocheck
import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { User } from "../../models/User";
import { Group } from "../../models/Group";
import moment from "moment";

import { validateRequest } from "../../errors";
import { requireUserAuth } from "../../middleware/user/require-user-auth";
import { createMessageAndSendToGroup } from "../../middleware/message/create-message-and-send-to-group";
import { checkValidGroupId } from "../../middleware/message/check-valid-groupId";
import mongoose from "mongoose";

const router = express.Router();
const DEFAULT_PER_PAGE = 5;

//user send message to group
router.post(
  "/api/v1/group/newMessage",
  [
    body("messageContent")
      .isString()
      .withMessage("Message Content Must Be given"),
    body("groupId")
      .isMongoId()
      .withMessage("Group Id Must Be given to send message"),
  ],
  //check group exists later
  validateRequest,
  requireUserAuth,
  checkValidGroupId,
  createMessageAndSendToGroup,
  async (req: Request, res: Response) => {
    res.send({
      status: "Message Sent",
    });
    return;
  }
);

router.get(
  "/api/v1/groups/:groupId",
  [param("groupId").isMongoId().withMessage("Group Id Must Be Valid")],
  validateRequest,
  async (req: Request, res: Response) => {
    const groups = await Group.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.groupId),
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "messages",
          foreignField: "_id",
          as: "messages",
        },
      },
    ]);
    await optimizedGraphOutput(groups);
    res.send(groups);
    return;
  }
);

router.get(
  "/api/v1/groups",
  [],
  validateRequest,
  async (req: Request, res: Response) => {
    //pagination
    let page = parseInt(req.query.page) || 0;
    const perPage = parseInt(req.query.perPage) || DEFAULT_PER_PAGE;
    const totalGroups = await Group.find({}).countDocuments();
    if (page >= Math.ceil(totalGroups / perPage) || page < 0) {
      page = 0;
    }
    //first get data
    const groups = await Group.aggregate([
      {
        $lookup: {
          from: "messages",
          localField: "messages",
          foreignField: "_id",
          as: "messages",
        },
      },
      {
        $skip: perPage * page,
      },
      {
        $limit: perPage,
      },
    ]);
    await optimizedGraphOutput(groups);
    res.send({
      groups,
      currentPage: page,
      totalPages: Math.ceil(groups.length / perPage),
    });
    return;
  }
);

const optimizedGraphOutput = async (groups: Array<Object>) => {
  let authorCache = {};
  for (let group of groups) {
    const groupId = group._id;
    delete group._id;
    delete group.__v;
    delete group.updatedAt;
    const createdAtISO = group.createdAt;
    delete group.createdAt;
    group.createdAt = createdAtISO.getTime();
    group.groupId = groupId;
    for (let message of group.messages) {
      const messageId = message._id;
      delete message._id;
      delete message.__v;
      delete message.updatedAt;
      const messageCreateAtISO = message.createdAt;
      delete message.createdAt;
      message.timeStamp = messageCreateAtISO.getTime();
      message.messageId = messageId;
      message.timeString = moment(message.timeStamp).format(
        "DD MMM YYYY hh:mm a"
      );
      let author;
      if (!authorCache[message.author]) {
        console.log("USER DETAILS NOT IN CACHE");
        author = await User.findById(message.author);
        authorCache[message.author] = author;
      } else {
        console.log(" USER DETAILS SERVING FROM CACHE");
        author = authorCache[message.author];
      }
      message.author = author.name;
      message.authorId = author._id;
    }
  }
};
export { router as userMessageRoutes };
