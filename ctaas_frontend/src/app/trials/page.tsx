"use client";

import Layout from "@/components/Layout";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getTrials } from "@/lib/apiService"; // Import the API service

interface Trial {
  id: string;
  name: string;
  sponsor: string;
  phase: string;
  status: string;
  start_date: string; // Assuming API returns snake_case
  // Add other fields as returned by your API
}

export default function TrialsListPage() {
  const [trialsData, setTrialsData] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        setIsLoading(true);
        const data = await getTrials(); // Call the API function
        // Ensure the data is an array, and transform if necessary
        setTrialsData(Array.isArray(data.trials) ? data.trials : []); 
        setError(null);
      } catch (err) {
        console.error("Failed to fetch trials:", err);
        setError("Failed to load trials. Please try again later.");
        setTrialsData([]); // Clear data on error
      }
      setIsLoading(false);
    };

    fetchTrials();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clinical Trials</h1>
          <Link href="/trials/new" legacyBehavior>
            <a className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
              Create New Trial
            </a>
          </Link>
        </div>

        {/* Search and Filter Placeholder - Functionality to be added */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="search" placeholder="Search by Trial Name or ID..." className="px-3 py-2 border rounded-md col-span-1 md:col-span-2" />
            <select className="px-3 py-2 border rounded-md">
              <option value="">All Statuses</option>
              <option value="recruiting">Recruiting</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>

        {isLoading && <p>Loading trials...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trialsData.length > 0 ? trialsData.map((trial) => (
                  <tr key={trial.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link href={`/trials/${trial.id}`} legacyBehavior>
                        <a className="text-blue-600 hover:text-blue-800">{trial.name}</a>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trial.sponsor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trial.phase}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trial.status === "Active" || trial.status === "Recruiting"
                            ? "bg-green-100 text-green-800"
                            : trial.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : trial.status === "On Hold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {trial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(trial.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/trials/${trial.id}`} legacyBehavior>
                        <a className="text-indigo-600 hover:text-indigo-900 mr-3">View Details</a>
                      </Link>
                      {/* Edit/Archive actions can be added here based on permissions */}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No trials found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Placeholder - Functionality to be added */}
        {!isLoading && !error && trialsData.length > 0 && (
            <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                    </a>
                    <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                    </a>
                    <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                    </a>
                    <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                    </a>
                </nav>
            </div>
        )}
      </div>
    </Layout>
  );
}

