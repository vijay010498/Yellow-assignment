import express, { json, Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../../../models/User";
import { Group } from "../../../models/Group";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  NotAuthorizedError,
  validateRequest,
} from "../../../errors";
import { checkUserExists } from "../../../errors/middleware/check-user-exists";
import { Password } from "../../../services/auth/password";
const keys = require("../../../config/keys");
const router = express.Router();

//SIGN UP
router.post(
  "/api/v1/user/signup",
  [
    body("name").isString().withMessage("Name Must Be Valid"),
    body("email").isEmail().withMessage("Email Must Be Valid"),
    body("password")
      .trim()
      .isLength({
        min: 6,
        max: 20,
      })
      .withMessage("Password Must be between 6 and 20"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError(`${email} already exists`);
    }
    try {
      const user = User.build({
        email,
        name,
        password,
      });
      await user.save();

      //generate jwt and store in request session
      const JWT = await jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        keys.jwtUserKey,
        {
          expiresIn: keys.jwyUserExpireTime,
          algorithm: "HS512",
        }
      );
      req.session = {
        JWT,
      };
      res.status(201).send(user);
      return;
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
      return;
    }
  }
);

//SIGN IN
router.post(
  "/api/v1/user/signIn",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You Must supply a password"),
  ],
  validateRequest,
  checkUserExists, //middleware to check is user exists already
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    //check for password matches
    const passwordMatches = await Password.compare(user!.password, password);
    if (!passwordMatches) {
      throw new NotAuthorizedError("Invalid Password");
    }
    //Generate JWT ans store in session
    try {
      const JWT = await jwt.sign(
        {
          userId: user!.id,
          email: user!.email,
          name: user!.name,
        },
        keys.jwtUserKey,
        {
          expiresIn: keys.jwyUserExpireTime,
          algorithm: "HS512",
        }
      );
      req.session = {
        JWT,
      };
      res.status(201).send(user);
      return;
    } catch (err) {
      console.error(err);
      res.status(401).send(err);
      return;
    }
  }
);

//temp to create group route
router.post(
  "/api/test/createGroup",
  [],
  validateRequest,
  async (req: Request, res: Response) => {
    //group name
    const { name } = req.body;
    //create group
    try {
      const group = Group.build({
        name,
      });
      await group.save();

      res.status(201).send(group);
      return;
    } catch (err) {
      console.error(err);
      res.status(401).send(err);
      return;
    }
  }
);

export { router as userAuthRoutes };
