import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "DeliveryAgent", default: null },
    status: {
      type: String,
      enum: ["pending", "confirmed", "ready", "picked_up", "on_the_way", "delivered"],
      default: "pending",
    },
    total: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true },
  },
  { timestamps: true },
);

export const Order = models.Order || model("Order", OrderSchema);

