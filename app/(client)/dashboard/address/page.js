import AddressPageClient from "./AddressPageClient";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export default async function AddressPage() {
  await dbConnect();
  const session = await auth();

  const user = await User.findOne({ email: session?.user?.email }).lean();

  // Pull the first address from the array to pre-fill the form
  const firstAddress = user?.addresses?.[0] || {};

  const initialData = {
    name: user?.name || session?.user?.name || "",
    email: user?.email || session?.user?.email || "", // 💡 Pass email to initialData
    address: {
      phone: firstAddress.phone || "",
      city: firstAddress.city || "",
      street: firstAddress.street || "",
      zipCode: firstAddress.zipCode || "",
      deliveryCharge: firstAddress.deliveryCharge || 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50/30 rounded-3xl">
      <AddressPageClient initialData={initialData} />
    </div>
  );
}