"use client";

import Layout from "@/components/Layout";
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { getTrialById } from "@/lib/apiService"; // Import API service
import ProtocolTabContent from "@/components/ProtocolTabContent";
import IRBSubmissionTabContent from "@/components/IRBSubmissionTabContent";
import SiteTabContent from "@/components/SiteTabContent";
import PatientTabContent from "@/components/PatientTabContent";
import MonitoringTabContent from "@/components/MonitoringTabContent";
// import ReportsTabContent from "@/components/ReportsTabContent"; // Assuming this will be created

// Placeholder for ReportsTabContent if not yet created
const ReportsTabContent = ({ trialId }: { trialId: string }) => (
  <div className="mt-4 p-4 border rounded-md bg-white">
    <h3 className="text-lg font-semibold mb-2">Regulatory Reports for Trial: {trialId}</h3>
    <p>Generated reports, download options, and report generation tools will appear here.</p>
  </div>
);

interface TrialDetails {
  id: string;
  name: string;
  sponsor: string;
  phase: string;
  status: string;
  objectives: string;
  start_date: string; // Assuming API returns snake_case
  end_date: string;   // Assuming API returns snake_case
  // Add other fields as returned by your API
}

export default function TrialDetailPage() {
  const params = useParams();
  const trialId = params?.trialId as string;
  const [trial, setTrial] = useState<TrialDetails | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trialId) {
      const fetchTrialDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getTrialById(trialId);
          // Assuming the API returns the trial object directly or nested (e.g., data.trial)
          setTrial(data.trial ? data.trial : data); 
        } catch (err) {
          console.error(`Failed to fetch trial ${trialId}:`, err);
          setError(`Failed to load trial details for ${trialId}. Please try again later.`);
          setTrial(null);
        }
        setIsLoading(false);
      };
      fetchTrialDetails();
    }
  }, [trialId]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "protocol", label: "Protocol" },
    { id: "irb", label: "IRB Submissions" },
    { id: "sites", label: "Sites" },
    { id: "patients", label: "Patients" },
    { id: "monitoring", label: "Monitoring" },
    { id: "reports", label: "Reports" },
  ];

  if (isLoading) {
    return <Layout><div className="container mx-auto py-10 flex justify-center items-center"><p>Loading trial details...</p></div></Layout>;
  }

  if (error) {
    return <Layout><div className="container mx-auto py-10"><p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p></div></Layout>;
  }
  
  if (!trial) {
    return <Layout><div className="container mx-auto py-10"><p>Trial not found.</p></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link href="/trials" legacyBehavior>
            <a className="text-blue-600 hover:text-blue-800">&larr; Back to Trials List</a>
          </Link>
          <h1 className="text-3xl font-bold mt-2">{trial.name}</h1>
          <p className="text-lg text-gray-600">
            Sponsor: {trial.sponsor} | Phase: {trial.phase} | Status: 
            <span className={`font-semibold ml-1 ${trial.status === "Recruiting" || trial.status === "Active" ? "text-green-600" : trial.status === "Completed" ? "text-blue-600" : trial.status === "On Hold" ? "text-yellow-600" : "text-gray-600"}`}>
              {trial.status}
            </span>
          </p>
        </div>

        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === "overview" && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Trial Overview</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Objectives</dt>
                  <dd className="mt-1 text-sm text-gray-900">{trial.objectives || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sponsor</dt>
                  <dd className="mt-1 text-sm text-gray-900">{trial.sponsor}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phase</dt>
                  <dd className="mt-1 text-sm text-gray-900">{trial.phase}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{trial.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(trial.start_date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(trial.end_date).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          )}
          {activeTab === "protocol" && <ProtocolTabContent trialId={trial.id} />}
          {activeTab === "irb" && <IRBSubmissionTabContent trialId={trial.id} />}
          {activeTab === "sites" && <SiteTabContent trialId={trial.id} />}
          {activeTab === "patients" && <PatientTabContent trialId={trial.id} />}
          {activeTab === "monitoring" && <MonitoringTabContent trialId={trial.id} />}
          {activeTab === "reports" && <ReportsTabContent trialId={trial.id} />}
        </div>
      </div>
    </Layout>
  );
}

