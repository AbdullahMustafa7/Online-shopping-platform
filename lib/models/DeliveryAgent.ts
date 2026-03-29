import { Schema, model, models } from "mongoose";

const DeliveryAgentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    available: { type: Boolean, default: true },
    totalDeliveries: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const DeliveryAgent =
  models.DeliveryAgent || model("DeliveryAgent", DeliveryAgentSchema);

