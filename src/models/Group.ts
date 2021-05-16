import mongoose from "mongoose";

interface GroupAttrs {
  name: String;
}

interface GroupModel extends mongoose.Model<GroupDoc> {
  build(attrs: GroupAttrs): GroupDoc;
}

interface GroupDoc extends mongoose.Document {
  name: String;
  messages: Array<mongoose.Schema.Types.ObjectId>;
}

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          required: true,
        },
      ],
      required: false,
      default: [],
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

groupSchema.statics.build = (attrs: GroupAttrs) => {
  return new Group(attrs);
};
const Group = mongoose.model<GroupDoc, GroupModel>("Group", groupSchema);
export { Group };
