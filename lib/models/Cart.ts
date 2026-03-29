import { Schema, model, models } from "mongoose";

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true },
);

CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Cart = models.Cart || model("Cart", CartSchema);

