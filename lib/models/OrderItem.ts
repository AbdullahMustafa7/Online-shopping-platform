import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const OrderItem = models.OrderItem || model("OrderItem", OrderItemSchema);

