import React, { useState, useEffect } from "react";
import { getSitesForTrial, associateSiteToTrial, getGlobalSites } from "@/lib/apiService";
import axios from "axios";

interface Site {
  id: string;
  name: string;
  status: string; // e.g., "Invited", "Screening", "Active"
  principal_investigator?: string;
  // Add other relevant fields from your API response
}

interface GlobalSite {
  id: string;
  name: string;
  location?: string;
}

interface SiteTabContentProps {
  trialId: string;
}

const SiteTabContent: React.FC<SiteTabContentProps> = ({ trialId }) => {
  const [associatedSites, setAssociatedSites] = useState<Site[]>([]);
  const [globalSites, setGlobalSites] = useState<GlobalSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [selectedGlobalSiteId, setSelectedGlobalSiteId] = useState<string>("");

  const fetchAssociatedSites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSitesForTrial(trialId);
      setAssociatedSites(Array.isArray(data.sites) ? data.sites : []);
    } catch (err) {
      console.error(`Error fetching sites for trial ${trialId}:`, err);
      setError("Failed to load associated sites.");
      setAssociatedSites([]);
    }
    setIsLoading(false);
  };

  const fetchGlobalSites = async () => {
    try {
      const data = await getGlobalSites();
      setGlobalSites(Array.isArray(data.sites) ? data.sites : []);
    } catch (err) {
      console.error("Error fetching global sites:", err);
      // Non-critical error, modal can still function if list is empty
    }
  };

  useEffect(() => {
    if (trialId) {
      fetchAssociatedSites();
      fetchGlobalSites(); // Fetch global sites for the modal
    }
  }, [trialId]);

  const handleAssociateSite = async () => {
    if (!selectedGlobalSiteId) {
      setError("Please select a site to associate.");
      return;
    }
    setIsAssociating(true);
    setError(null);
    try {
      // Assuming the API expects the global site ID to associate
      // and potentially an initial status for the site within this trial
      const siteToAssociate = globalSites.find(s => s.id === selectedGlobalSiteId);
      if (!siteToAssociate) {
        setError("Selected site not found.");
        setIsAssociating(false);
        return;
      }

      const associationData = {
        site_id: selectedGlobalSiteId, // This might vary based on API design, could be `id` or `global_site_id`
        // name: siteToAssociate.name, // Send name if API expects it for new association
        status: "Invited", // Default status for newly associated site
      };
      await associateSiteToTrial(trialId, associationData);
      await fetchAssociatedSites(); // Refresh the list
      setShowAssociateModal(false);
      setSelectedGlobalSiteId("");
    } catch (err) {
      console.error("Error associating site:", err);
      let errorMessage = "Failed to associate site.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
    setIsAssociating(false);
  };

  return (
    <div className="mt-4 p-6 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Site Management</h3>
        <button 
          onClick={() => setShowAssociateModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Associate New Site
        </button>
      </div>
      <p className="text-gray-600 mb-2">Trial ID: {trialId}</p>

      {error && <p className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">Error: {error}</p>}

      {isLoading ? (
        <p>Loading associated sites...</p>
      ) : associatedSites.length > 0 ? (
        <div className="space-y-3">
          {associatedSites.map((site) => (
            <div key={site.id} className="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{site.name}</p>
                <p className="text-sm text-gray-500">Status: {site.status} {site.principal_investigator ? `| PI: ${site.principal_investigator}` : ""}</p>
              </div>
              {/* Placeholder for Manage button/link - could lead to a site-specific detail view or edit modal */}
              <button className="text-sm text-indigo-600 hover:text-indigo-900">Manage (Placeholder)</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No sites currently associated with this trial.</p>
      )}

      {/* Modal for Associating New Site */}
      {showAssociateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Associate Site to Trial</h3>
              <div className="mt-2 px-7 py-3">
                <label htmlFor="globalSiteSelect" className="block text-sm font-medium text-gray-700 text-left mb-1">Select Site:</label>
                <select 
                  id="globalSiteSelect"
                  value={selectedGlobalSiteId}
                  onChange={(e) => setSelectedGlobalSiteId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">-- Select a Site --</option>
                  {globalSites.map(gs => (
                    <option key={gs.id} value={gs.id}>{gs.name} {gs.location ? `(${gs.location})` : ""}</option>
                  ))}
                </select>
                {globalSites.length === 0 && <p className="text-xs text-gray-500 mt-1">No global sites available to associate. Please add sites via Admin panel.</p>}
              </div>
              <div className="items-center px-4 py-3 space-x-3">
                <button
                  id="cancel-btn"
                  onClick={() => {
                    setShowAssociateModal(false);
                    setSelectedGlobalSiteId("");
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  id="associate-btn"
                  onClick={handleAssociateSite}
                  disabled={isAssociating || !selectedGlobalSiteId}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                >
                  {isAssociating ? "Associating..." : "Associate Site"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <p className="mt-4 text-sm text-gray-500">List of clinical sites associated with this trial, their onboarding status, and site-specific actions are displayed here. This section interacts with API endpoints like <code>GET /api/v1/trials/{trialId}/sites</code> and <code>POST /api/v1/trials/{trialId}/sites</code>.</p>
    </div>
  );
};

export default SiteTabContent;

