import { Schema, model, Document, Types } from "mongoose";
import { ModerationCategory, EnforcementBehavior } from "../types";

export interface IPolicy extends Document {
  _id: Types.ObjectId;
  category: ModerationCategory;
  enabled: boolean;
  confidenceThreshold: number;
  enforcementBehavior: EnforcementBehavior;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    category: {
      type: String,
      enum: Object.values(ModerationCategory),
      required: true,
      unique: true,
    },
    enabled: { type: Boolean, default: true },
    confidenceThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.7,
    },
    enforcementBehavior: {
      type: String,
      enum: Object.values(EnforcementBehavior),
      default: EnforcementBehavior.FLAG_FOR_REVIEW,
    },
  },
  { timestamps: true }
);

export const Policy = model<IPolicy>("Policy", policySchema);
