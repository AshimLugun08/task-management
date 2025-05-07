// app/api/users/route.ts
import { connectDB } from "@/lib/db";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find().lean();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}