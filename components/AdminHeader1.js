// components/AdminHeader.js (Server Component)

export default function AdminHeader({ user }) {
    // The user object is passed down from the AdminLayout's successful authorization check.
    const userName = user?.name || user?.email || 'Admin User';

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
            {/* Left side: Navigation Context/Title */}
            <h1 className="text-xl font-semibold text-gray-800">
                Dashboard
            </h1>
            
            {/* Right side: User Greeting */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">Welcome,</span>
                <span className="font-bold text-blue-600">{userName}</span>
            </div>
        </header>
    );
}