import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    role: {
      type: String,
      enum: ["customer", "vendor", "agent", "admin"],
      default: "customer",
    },
    address: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

export const User = models.User || model("User", UserSchema);

