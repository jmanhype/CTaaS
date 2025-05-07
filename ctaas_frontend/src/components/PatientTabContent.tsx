import React, { useState, useEffect } from "react";
import { getPatientsForTrial, identifyPatientsForTrial, getPatientIdentificationStatus } from "@/lib/apiService";
import axios from "axios";

interface Patient {
  id: string;
  patient_identifier: string; // e.g., P001-S01
  status: string; // e.g., "Enrolled", "Screen Failed", "Identified"
  enrollment_date?: string;
  screening_date?: string;
  identification_date?: string;
  site_name?: string; // If available from API
  // Add other relevant fields from your API response
}

interface PatientTabContentProps {
  trialId: string;
}

const PatientTabContent: React.FC<PatientTabContentProps> = ({ trialId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationStatus, setIdentificationStatus] = useState<string | null>(null);

  // TODO: Add state and handlers for patient identification criteria form/modal
  const [identificationCriteria, setIdentificationCriteria] = useState(""); // Simple example

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPatientsForTrial(trialId);
      setPatients(Array.isArray(data.patients) ? data.patients : []);
    } catch (err) {
      console.error(`Error fetching patients for trial ${trialId}:`, err);
      setError("Failed to load patient data.");
      setPatients([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (trialId) {
      fetchPatients();
    }
  }, [trialId]);

  const handleIdentifyPatients = async () => {
    // In a real app, this would likely open a modal to collect criteria
    if (!identificationCriteria.trim() && false) { // Disabled for now, criteria form not built
        setError("Identification criteria cannot be empty.");
        return;
    }
    setIsIdentifying(true);
    setIdentificationStatus("Initiating patient identification...");
    setError(null);
    try {
      const criteriaParams = { criteria_details: identificationCriteria || "General identification request" };
      const response = await identifyPatientsForTrial(trialId, criteriaParams);
      setIdentificationStatus(`Identification task started (ID: ${response.task_id}). Checking status...`);

      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await getPatientIdentificationStatus(response.task_id);
          setIdentificationStatus(`Identification status: ${statusResponse.status}. Details: ${statusResponse.message || 'Processing...'}`);
          if (statusResponse.status === "COMPLETED" || statusResponse.status === "FAILED") {
            clearInterval(pollInterval);
            setIsIdentifying(false);
            if (statusResponse.status === "COMPLETED") {
              setIdentificationStatus("Patient identification completed! Refreshing list...");
              await fetchPatients(); // Refresh the list
            } else {
              setError(`Patient identification failed: ${statusResponse.message || 'Unknown error'}`);
            }
          }
        } catch (pollError) {
          console.error("Error polling identification status:", pollError);
          setError("Error checking identification status.");
          clearInterval(pollInterval);
          setIsIdentifying(false);
        }
      }, 5000); // Poll every 5 seconds

    } catch (err) {
      console.error("Error initiating patient identification:", err);
      let errorMessage = "Failed to initiate patient identification.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setIsIdentifying(false);
      setIdentificationStatus(null);
    }
  };

  return (
    <div className="mt-4 p-6 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Patient Recruitment & Management</h3>
        {/* TODO: Convert button to open a modal for identification criteria */}
        <button 
          onClick={handleIdentifyPatients}
          disabled={isIdentifying}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isIdentifying ? "Identifying..." : "Identify Patients"}
        </button>
      </div>
      <p className="text-gray-600 mb-2">Trial ID: {trialId}</p>

      {identificationStatus && <p className="mb-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">{identificationStatus}</p>}
      {error && <p className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">Error: {error}</p>}
      
      {/* Placeholder for criteria input - should be a form/modal */}
      {/* <div className="mb-4">
        <label htmlFor="identificationCriteria" className="block text-sm font-medium text-gray-700">Identification Criteria (Test):</label>
        <textarea 
            id="identificationCriteria" 
            rows={2} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={identificationCriteria} 
            onChange={(e) => setIdentificationCriteria(e.target.value)} 
        />
      </div> */} 

      {isLoading ? (
        <p>Loading patient data...</p>
      ) : patients.length > 0 ? (
        <>
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700">Recruitment Overview</h4>
            {/* TODO: Fetch summary stats from API if available, or calculate from patients list */}
            <p className="text-sm text-gray-600">Total Identified/Enrolled: {patients.length}</p>
          </div>
          <div className="space-y-3">
            {patients.map((patient) => (
              <div key={patient.id} className="p-3 border rounded-md bg-gray-50">
                <p className="font-medium text-gray-800">Patient ID: {patient.patient_identifier} {patient.site_name ? `(Site: ${patient.site_name})` : ""}</p>
                <p className="text-sm text-gray-500">
                  Status: {patient.status} 
                  {patient.enrollment_date && ` | Enrolled: ${new Date(patient.enrollment_date).toLocaleDateString()}`}
                  {patient.screening_date && ` | Screened: ${new Date(patient.screening_date).toLocaleDateString()}`}
                  {patient.identification_date && ` | Identified: ${new Date(patient.identification_date).toLocaleDateString()}`}
                </p>
                {/* Add more patient details or actions here */}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No patients found for this trial.</p>
      )}
      
      <p className="mt-4 text-sm text-gray-500">Patient identification status, enrollment details, and recruitment metrics are displayed here. This section interacts with API endpoints like <code>POST /api/v1/trials/{trialId}/patients/identify</code> and <code>GET /api/v1/trials/{trialId}/patients</code>.</p>
    </div>
  );
};

export default PatientTabContent;

