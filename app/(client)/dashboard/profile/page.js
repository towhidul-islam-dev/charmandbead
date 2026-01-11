// app/(client)/profile/page.jsx
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { updateProfile } from "@/actions/userActions"; // We will create this action
import ProfileForm from "@/components/ProfileForm"; // We will move the form to a client component

export default async function ProfilePage() {
    const session = await auth();
    await dbConnect();

    // Fetch the latest user data from DB
    const user = await User.findOne({ email: session?.user?.email }).lean();

    if (!user) return <div>Please log in to view this page.</div>;

    // Get initials for the avatar
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <div className="max-w-2xl">
            <h1 className="text-xl font-bold border-b pb-4 mb-6">Profile Information</h1>
            
            {/* We pass the data to a Client Component to handle the form submission */}
            <ProfileForm user={JSON.parse(JSON.stringify(user))} initials={initials} />
        </div>
    );
}