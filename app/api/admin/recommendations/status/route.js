import dbConnect from "@/lib/dbConnect";
import Recommendation from "@/models/Recommendation";

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    await dbConnect();
    const updated = await Recommendation.findByIdAndUpdate(id, { status }, { new: true });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: "Failed to update status" }, { status: 500 });
  }
}