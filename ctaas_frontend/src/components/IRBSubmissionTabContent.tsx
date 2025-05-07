import React, { useState, useEffect } from "react";
import { getIRBSubmissionsForTrial, createIRBSubmission } from "@/lib/apiService";
import axios from "axios";

interface IRBSubmission {
  id: string;
  name: string; // Or a more specific title field
  status: string;
  submitted_at: string;
  approved_at?: string; // Optional
  // Add other relevant fields from your API response
}

interface IRBSubmissionTabContentProps {
  trialId: string;
}

const IRBSubmissionTabContent: React.FC<IRBSubmissionTabContentProps> = ({ trialId }) => {
  const [submissions, setSubmissions] = useState<IRBSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // TODO: Add state and handlers for a form to create new submissions
  const [newSubmissionName, setNewSubmissionName] = useState("");

  const fetchIRBSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getIRBSubmissionsForTrial(trialId);
      setSubmissions(Array.isArray(data.irb_submissions) ? data.irb_submissions : []);
    } catch (err) {
      console.error(`Error fetching IRB submissions for trial ${trialId}:`, err);
      setError("Failed to load IRB submissions.");
      setSubmissions([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (trialId) {
      fetchIRBSubmissions();
    }
  }, [trialId]);

  const handleCreateNewSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newSubmissionName.trim()) {
        setError("Submission name cannot be empty.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      // Basic parameters, can be expanded with a modal form for more details
      const submissionData = { 
        name: newSubmissionName, 
        // documents: [], // Placeholder for document uploads if supported
        submission_date: new Date().toISOString().split('T')[0], // Example date
        status: "Submitted" // Default status
      };
      await createIRBSubmission(trialId, submissionData);
      setNewSubmissionName(""); // Clear form field
      await fetchIRBSubmissions(); // Refresh the list
    } catch (err) {
      console.error("Error creating new IRB submission:", err);
      let errorMessage = "Failed to create IRB submission.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-4 p-6 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">IRB Submissions</h3>
        {/* TODO: Convert button to open a modal form for new submission */}
      </div>
      <p className="text-gray-600 mb-2">Trial ID: {trialId}</p>

      {error && <p className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">Error: {error}</p>}

      {/* Form for new submission - basic example */}
      <form onSubmit={handleCreateNewSubmission} className="mb-6 p-4 border rounded-md bg-gray-50">
        <h4 className="text-md font-semibold mb-2">Add New IRB Submission</h4>
        <div>
          <label htmlFor="newSubmissionName" className="block text-sm font-medium text-gray-700 mb-1">Submission Name/Title</label>
          <input 
            type="text" 
            id="newSubmissionName" 
            value={newSubmissionName} 
            onChange={(e) => setNewSubmissionName(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Initial Approval Package, Amendment 001"
            required
          />
        </div>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="mt-3 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Add Submission"}
        </button>
      </form>

      {isLoading ? (
        <p>Loading IRB submissions...</p>
      ) : submissions.length > 0 ? (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-3 border rounded-md bg-gray-50">
              <p className="font-medium text-gray-800">{submission.name}</p>
              <p className="text-sm text-gray-500">
                Status: {submission.status} | Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                {submission.approved_at && ` | Approved: ${new Date(submission.approved_at).toLocaleDateString()}`}
              </p>
              {/* Placeholder for View/Download documents link */}
              <a href={`#irb-${submission.id}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">View Documents (Placeholder)</a>
            </div>
          ))}
        </div>
      ) : (
        <p>No IRB submissions found for this trial.</p>
      )}
      
      <p className="mt-4 text-sm text-gray-500">Details of IRB submissions, their statuses, relevant documents, and actions to add or update submissions are displayed here. This section interacts with API endpoints like <code>GET /api/v1/trials/{trialId}/irb-submissions</code> and <code>POST /api/v1/trials/{trialId}/irb-submissions</code>.</p>
    </div>
  );
};

export default IRBSubmissionTabContent;

