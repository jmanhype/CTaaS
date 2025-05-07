import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createTrial } from "@/lib/apiService"; // Import the API service

interface TrialFormData {
  name: string;
  sponsor: string;
  phase: string;
  start_date: string; // API expects snake_case
  end_date: string;   // API expects snake_case
  objectives: string;
  status: string; // Default status for new trials
  // Add any other fields required by the POST /api/v1/trials endpoint
}

export default function NewTrialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TrialFormData>({
    name: "",
    sponsor: "",
    phase: "Phase I",
    start_date: "",
    end_date: "",
    objectives: "",
    status: "Pending", // Or any default status your API expects
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Ensure date formats are as expected by the API if necessary
      // For example, if API expects YYYY-MM-DD and input type="date" provides that, no change needed.
      // Otherwise, transform formData.start_date and formData.end_date here.
      
      const trialPayload = {
        name: formData.name,
        sponsor: formData.sponsor,
        phase: formData.phase,
        start_date: formData.start_date,
        end_date: formData.end_date,
        objectives: formData.objectives,
        status: formData.status,
        // Include other necessary fields from your API design document
        // e.g. therapeutic_area, principal_investigator_id etc.
      };

      const newTrial = await createTrial(trialPayload);
      console.log("New trial created:", newTrial);
      // On success, redirect to the new trial's detail page or trials list
      // Assuming newTrial.id is returned by the API
      if (newTrial && newTrial.id) {
        router.push(`/trials/${newTrial.id}`);
      } else {
        router.push("/trials"); // Fallback to trials list
      }
    } catch (err) {
      console.error("Failed to create trial:", err);
      let errorMessage = "Failed to create trial. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Create New Clinical Trial</h1>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Trial Name / Title</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="sponsor" className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
            <input
              type="text"
              name="sponsor"
              id="sponsor"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.sponsor}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phase" className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
            <select
              name="phase"
              id="phase"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.phase}
              onChange={handleChange}
            >
              <option>Phase I</option>
              <option>Phase II</option>
              <option>Phase III</option>
              <option>Phase IV</option>
              <option>Not Applicable</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Planned Start Date</label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Planned End Date</label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-1">Key Objectives</label>
            <textarea
              name="objectives"
              id="objectives"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.objectives}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              id="status"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Recruiting">Recruiting</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Create Trial"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
// Need to import axios for isAxiosError check
import axios from "axios";

