import { Schema, model, Document, Types } from "mongoose";
import { AppealStatus } from "../types";

export interface IAppeal extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  submission: Types.ObjectId;
  imageId: Types.ObjectId; // references the specific image within the submission
  justification: string;
  status: AppealStatus;
  adminResponse?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appealSchema = new Schema<IAppeal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    submission: { type: Schema.Types.ObjectId, ref: "Submission", required: true },
    imageId: { type: Schema.Types.ObjectId, required: true },
    justification: { type: String, required: true, minlength: 10 },
    status: {
      type: String,
      enum: Object.values(AppealStatus),
      default: AppealStatus.PENDING,
      index: true,
    },
    adminResponse: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Appeal = model<IAppeal>("Appeal", appealSchema);
