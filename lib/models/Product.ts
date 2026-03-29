import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export const Product = models.Product || model("Product", ProductSchema);

