import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/lib/models/Category";

export async function GET() {
  await connectDB();
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  return NextResponse.json(categories);
}

