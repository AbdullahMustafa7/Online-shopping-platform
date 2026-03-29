import { Schema, model, models } from "mongoose";

const RatingSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "DeliveryAgent", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
  },
  { timestamps: true },
);

export const Rating = models.Rating || model("Rating", RatingSchema);

