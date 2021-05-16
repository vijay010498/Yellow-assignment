import mongoose from "mongoose";
import { Password } from "../services/auth/password";

interface UserAttrs {
  email: string;
  password: string;
  name: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  name: string;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        const createdAtISO = ret.createdAt;
        delete ret.createdAt;
        ret.createdAt = createdAtISO.getTime();
        const updatedAtISO = ret.updatedAt;
        delete ret.updatedAt;
        ret.updatedAt = updatedAtISO.getTime();
      },
    },
  }
);
UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});
UserSchema.pre("findOneAndUpdate", async function (next) {
  // @ts-ignore
  const password = this.getUpdate().$set.password;
  if (!password) {
    // @ts-ignore
    return next();
  }
  try {
    const hashed = await Password.toHash(password);
    this.set("password", hashed);
  } catch (error) {
    return next(error);
  }
});
UserSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);
export { User };
