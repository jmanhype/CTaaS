"use client";
import Layout from "@/components/Layout";
import withAuth from "@/components/withAuth"; // Import the HOC
import React from "react"; // Import React if not already

// Define props if your page expects any, otherwise an empty object or remove if not needed by withAuth
interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder Summary Cards - These should be populated with real data via API calls */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Active Trials</h2>
            {/* TODO: Fetch and display actual count */}
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View all active trials</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Patients Enrolled</h2>
            {/* TODO: Fetch and display actual count */}
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all active trials</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pending IRB Submissions</h2>
            {/* TODO: Fetch and display actual count */}
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Require attention</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Recent Activity (Placeholder)</h2>
            {/* TODO: Fetch and display recent activity */}
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>No recent activity to display.</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrap the component with withAuth. 
// If specific roles are required for the dashboard, pass them as a second argument.
// For example, if all authenticated users can see it: export default withAuth(DashboardPage);
// If only 'Admin' and 'SponsorUser' can see it: export default withAuth(DashboardPage, ['Admin', 'SponsorUser']);
export default withAuth(DashboardPage);

