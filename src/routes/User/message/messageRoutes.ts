import express, { json, Request, Response } from "express";
import { body } from "express-validator";
import { Message } from "../../../models/Message";
import { Group } from "../../../models/Group";

import { validateRequest } from "../../../errors";
import { requireUserAuth } from "../../../middleware/user/require-user-auth";
import { createMessageAndSendToGroup } from "../../../middleware/message/create-message-and-send-to-group";
import { checkValidGroupId } from "../../../middleware/message/check-valid-groupId";
const router = express.Router();

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
export { router as userMessageRoutes };
