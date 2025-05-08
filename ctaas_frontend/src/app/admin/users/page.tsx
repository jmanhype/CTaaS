"use client";

import Layout from "@/components/Layout";
import Link from "next/link"; // Keep if you have links like "Create New User"
import React, { useEffect, useState } from "react";
import { getUsers, updateUser, createUser } from "@/lib/apiService"; // Import the API service
import axios from "axios";

interface User {
  id: string;
  username: string;
  full_name: string; // Assuming API returns snake_case
  email: string;
  roles: string[]; // Assuming roles is an array of strings
  status: string;
  last_login_at?: string; // Assuming API might return this, and it could be optional
}

export default function UserManagementPage() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Add state and handlers for Create/Edit User Modals
  // For simplicity, edit/create actions are placeholders here.

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUsers(); // Call the API function
      setUsersData(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      let errorMessage = "Failed to load users. Please try again later.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setUsersData([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // TODO: Add role-based access control check here before fetching data
    // For now, assuming admin access
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      // Assuming the updateUser API can handle status changes
      // The payload might need specific structure based on your API
      await updateUser(user.id, { status: newStatus });
      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error(`Failed to update user ${user.id} status:`, err);
      setError(`Failed to update status for ${user.username}.`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          {/* Placeholder for Create New User button - Link to a new user form page or modal */}
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            onClick={() => alert("Create New User functionality to be implemented.")}
          >
            Create New User
          </button>
        </div>

        {/* Search and Filter Placeholder - Functionality to be added */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="search" placeholder="Search by Username, Name, or Email..." className="px-3 py-2 border rounded-md col-span-1 md:col-span-2" />
            <select className="px-3 py-2 border rounded-md">
              <option value="">All Roles</option>
              <option value="SponsorUser">Sponsor User</option>
              <option value="SiteCoordinator">Site Coordinator</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>

        {isLoading && <p>Loading users...</p>}
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

        {!isLoading && !error && (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData.length > 0 ? usersData.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.roles.join(", ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => alert(`Edit user ${user.username} - functionality to be implemented.`)}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user)}
                        className={`${user.status === "Active" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Placeholder - Functionality to be added if API supports pagination for users */}
      </div>
    </Layout>
  );
}

