import { Schema, model, models } from "mongoose";

const VendorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    shopName: { type: String, required: true },
    shopAddress: { type: String, default: null },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Vendor = models.Vendor || model("Vendor", VendorSchema);

