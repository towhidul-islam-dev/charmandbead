import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Recommendation from "@/models/Recommendation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Next.js 15 Fix: Unwrapping params Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await dbConnect();
    const updated = await Recommendation.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Next.js 15 Fix: Unwrapping params Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();
    const deleted = await Recommendation.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product already removed or not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}