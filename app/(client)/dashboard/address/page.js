import AddressPageClient from "./AddressPageClient";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export default async function AddressPage() {
  await dbConnect();
  const session = await auth();

  // Fetch the user fresh without .lean() or ensure addresses array is explicitly mapped
  const user = await User.findOne({ email: session?.user?.email });

  const initialData = {
    name: user?.name || session?.user?.name || "",
    email: user?.email || session?.user?.email || "",
    addresses: (user?.addresses || []).map((addr) => ({
      _id: addr._id ? addr._id.toString() : Math.random().toString(),
      label: addr.label || "Home",
      fullName: addr.fullName || user?.name || "",
      phone: addr.phone || "",
      district: addr.district || "Dhaka",
      thana: addr.thana || "",
      city: addr.city || "",
      street: addr.street || "",
      zipCode: addr.zipCode || "",
      deliveryCharge: addr.deliveryCharge || 80,
      isDefault: !!addr.isDefault,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50/30 rounded-3xl">
      <AddressPageClient initialData={initialData} />
    </div>
  );
}