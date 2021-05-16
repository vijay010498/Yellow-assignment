import mongoose from "mongoose";

interface MessageAttrs {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
}

interface MessageModel extends mongoose.Model<MessageDoc> {
  build(attrs: MessageAttrs): MessageDoc;
}

interface MessageDoc extends mongoose.Document {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
}
const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
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

messageSchema.statics.build = (attrs: MessageAttrs) => {
  return new Message(attrs);
};
const Message = mongoose.model<MessageDoc, MessageModel>(
  "Message",
  messageSchema
);
export { Message };
