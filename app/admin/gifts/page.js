import dbConnect from "@/lib/mongodb";
import Surprise from "@/models/Surprise";
import GiftManager from "@/components/admin/GiftManager";
import GiftSimulator from "@/components/admin/GiftSimulator";
import ManualOverride from "@/components/admin/ManualOverride"; // This will now resolve!

export default async function AdminGiftsPage() {
  await dbConnect();
  const gifts = await Surprise.find({}).sort({ createdAt: -1 });
  const serializedGifts = JSON.parse(JSON.stringify(gifts));

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-24 px-4 md:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <GiftManager gifts={serializedGifts} />
        <ManualOverride gifts={serializedGifts} />
        <div className="pt-10 border-t border-gray-200 border-dashed">
          <GiftSimulator />
        </div>
      </div>
    </div>
  );
}