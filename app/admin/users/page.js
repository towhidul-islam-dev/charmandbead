// app/admin/users/page.jsx (Server Component)

import { getUsers } from "@/lib/data";
import { Phone, MapPin } from "lucide-react"; // Optional: for consistent icons

export default async function AdminUsersPage() {
  const { users, success, error } = await getUsers();

  if (!success) {
    return (
      <div className="p-4 text-red-500 md:p-8">
        Error loading users: {error}
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto md:p-8 max-w-7xl">
      <h2 className="mb-6 text-2xl font-bold">
        Registered Users ({users.length})
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Role
              </th>
              {/* 💡 NEW COLUMNS */}
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Address
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Member Since
              </th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {user.name}
                  {user.addresses?.length > 1 && (
                    <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                      +{user.addresses.length - 1} more
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {user.role || "user"}
                  </span>
                </td>

                {/* 💡 NEW DATA: Phone Number */}
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap font-medium">
                  {user.addresses?.[0]?.phone ? (
                    <span className="flex items-center gap-1">
                      {user.addresses[0].phone}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs font-normal">
                      N/A
                    </span>
                  )}
                </td>

                {/* 💡 UPDATED DATA: Address (Accessing the array index 0) */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.addresses?.[0]?.street ? (
                    <div
                      className="max-w-xs truncate"
                      title={`${user.addresses[0].street}, ${user.addresses[0].city}`}
                    >
                      {user.addresses[0].street}, {user.addresses[0].city}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      No address
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <a
                    href={`/admin/users/edit/${user._id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
