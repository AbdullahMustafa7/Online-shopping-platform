import { NextResponse } from "next/server";
import { seedMongo } from "@/lib/seed";

export async function GET() {
  try {
    await seedMongo();
    return NextResponse.json({
      ok: true,
      message: "MongoDB seeded successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to seed MongoDB.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

