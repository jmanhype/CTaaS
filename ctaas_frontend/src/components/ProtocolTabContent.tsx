import React, { useState, useEffect } from 'react';
import { getProtocolsForTrial, draftProtocol, getProtocolGenerationStatus } from "@/lib/apiService";
import axios from 'axios'; // For error type checking

interface Protocol {
  id: string;
  version: string;
  status: string;
  created_at: string;
  // Add other relevant fields from your API response
}

interface ProtocolTabContentProps {
  trialId: string;
}

const ProtocolTabContent: React.FC<ProtocolTabContentProps> = ({ trialId }) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftingStatus, setDraftingStatus] = useState<string | null>(null);

  const fetchProtocols = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProtocolsForTrial(trialId);
      setProtocols(Array.isArray(data.protocols) ? data.protocols : []);
    } catch (err) {
      console.error(`Error fetching protocols for trial ${trialId}:`, err);
      setError("Failed to load protocols.");
      setProtocols([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (trialId) {
      fetchProtocols();
    }
  }, [trialId]);

  const handleDraftNewProtocol = async () => {
    setIsDrafting(true);
    setDraftingStatus("Initiating draft...");
    setError(null);
    try {
      // Basic parameters, can be expanded with a modal form
      const draftParams = { notes: "Initial draft request from UI" }; 
      const response = await draftProtocol(trialId, draftParams);
      setDraftingStatus(`Drafting initiated. Task ID: ${response.task_id}. Checking status...`);
      
      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await getProtocolGenerationStatus(response.task_id);
          setDraftingStatus(`Drafting status: ${statusResponse.status}. Details: ${statusResponse.message || 'Processing...'}`);
          if (statusResponse.status === "COMPLETED" || statusResponse.status === "FAILED") {
            clearInterval(pollInterval);
            setIsDrafting(false);
            if (statusResponse.status === "COMPLETED") {
              setDraftingStatus("Protocol drafted successfully! Refreshing list...");
              await fetchProtocols(); // Refresh the list
            } else {
              setError(`Protocol drafting failed: ${statusResponse.message || 'Unknown error'}`);
            }
          }
        } catch (pollError) {
          console.error("Error polling draft status:", pollError);
          setError("Error checking draft status.");
          clearInterval(pollInterval);
          setIsDrafting(false);
        }
      }, 5000); // Poll every 5 seconds

    } catch (err) {
      console.error("Error drafting new protocol:", err);
      let errorMessage = "Failed to initiate protocol draft.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setIsDrafting(false);
      setDraftingStatus(null);
    }
  };

  return (
    <div className="mt-4 p-6 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Protocol Management</h3>
        <button 
          onClick={handleDraftNewProtocol}
          disabled={isDrafting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isDrafting ? "Drafting..." : "Draft New Protocol"}
        </button>
      </div>
      <p className="text-gray-600 mb-2">Trial ID: {trialId}</p>

      {draftingStatus && <p className="mb-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">{draftingStatus}</p>}
      {error && <p className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">Error: {error}</p>}

      {isLoading ? (
        <p>Loading protocols...</p>
      ) : protocols.length > 0 ? (
        <div className="space-y-3">
          {protocols.map((protocol) => (
            <div key={protocol.id} className="p-3 border rounded-md bg-gray-50">
              <p className="font-medium text-gray-800">Protocol ID: {protocol.id} (Version: {protocol.version || 'N/A'})</p>
              <p className="text-sm text-gray-500">Status: {protocol.status} | Created: {new Date(protocol.created_at).toLocaleDateString()}</p>
              {/* Placeholder for View/Download link - requires API endpoint for specific protocol file */}
              <a href={`#protocol-${protocol.id}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">View/Download (Placeholder)</a>
            </div>
          ))}
        </div>
      ) : (
        <p>No protocols found for this trial.</p>
      )}
      
      <p className="mt-4 text-sm text-gray-500">Detailed protocol information, version history, and drafting options are displayed here. This section interacts with API endpoints like <code>GET /api/v1/trials/{trialId}/protocols</code> and <code>POST /api/v1/trials/{trialId}/protocols/draft</code>.</p>
    </div>
  );
};

export default ProtocolTabContent;

