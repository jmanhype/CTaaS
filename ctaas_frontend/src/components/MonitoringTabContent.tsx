import React, { useState, useEffect } from "react";
import { getMonitoringSummary, getMonitoringEvents } from "@/lib/apiService";
import axios from "axios";

interface MonitoringSummary {
  // Define based on your API response for summary
  // Example:
  total_adverse_events: number;
  data_quality_score: number;
  enrollment_rate: number;
  // Add other summary metrics
}

interface MonitoringEvent {
  id: string;
  timestamp: string;
  type: string; // e.g., "SAE_REPORTED", "PROTOCOL_DEVIATION"
  description: string;
  severity?: string;
  // Add other relevant fields
}

interface MonitoringTabContentProps {
  trialId: string;
}

const MonitoringTabContent: React.FC<MonitoringTabContentProps> = ({ trialId }) => {
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trialId) {
      const fetchMonitoringData = async () => {
        setIsLoadingSummary(true);
        setIsLoadingEvents(true);
        setError(null);
        try {
          const summaryData = await getMonitoringSummary(trialId);
          // Assuming API returns summary object directly or nested (e.g. summaryData.summary)
          setSummary(summaryData.summary ? summaryData.summary : summaryData);
        } catch (err) {
          console.error(`Error fetching monitoring summary for trial ${trialId}:`, err);
          setError("Failed to load monitoring summary.");
          setSummary(null);
        }
        setIsLoadingSummary(false);

        try {
          const eventsData = await getMonitoringEvents(trialId);
          setEvents(Array.isArray(eventsData.events) ? eventsData.events : []);
        } catch (err) {
          console.error(`Error fetching monitoring events for trial ${trialId}:`, err);
          setError(prevError => prevError ? `${prevError} Failed to load monitoring events.` : "Failed to load monitoring events.");
          setEvents([]);
        }
        setIsLoadingEvents(false);
      };
      fetchMonitoringData();
    }
  }, [trialId]);

  return (
    <div className="mt-4 p-6 border rounded-lg shadow bg-white">
      <h3 className="text-xl font-semibold mb-4">Data Monitoring</h3>
      <p className="text-gray-600 mb-2">Trial ID: {trialId}</p>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">Error: {error}</p>}

      {isLoadingSummary ? (
        <p>Loading monitoring summary...</p>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-1">Adverse Events</h4>
            <p className="text-2xl font-bold text-red-600">{summary.total_adverse_events ?? "N/A"}</p>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-1">Data Quality Score</h4>
            <p className="text-2xl font-bold text-green-600">{summary.data_quality_score ? `${summary.data_quality_score}%` : "N/A"}</p>
          </div>
          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-1">Enrollment Rate</h4>
            <p className="text-2xl font-bold text-blue-600">{summary.enrollment_rate ? `${summary.enrollment_rate}%` : "N/A"}</p>
          </div>
          {/* Add more summary cards based on your MonitoringSummary interface */}
        </div>
      ) : (
        !error && <p>No monitoring summary data available.</p>
      )}

      <h4 className="text-lg font-semibold mb-3 mt-6">Critical Events Log</h4>
      {isLoadingEvents ? (
        <p>Loading monitoring events...</p>
      ) : events.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="p-3 border rounded-md bg-gray-50">
              <p className="font-medium text-gray-800">{event.type} {event.severity ? `(${event.severity})` : ""}</p>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-xs text-gray-400">Logged: {new Date(event.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No critical events logged for this trial.</p>
      )}
      
      <p className="mt-4 text-sm text-gray-500">Real-time monitoring data, charts, and critical event logs are displayed here. This section interacts with API endpoints like <code>GET /api/v1/trials/{trialId}/monitoring/summary</code> and <code>GET /api/v1/trials/{trialId}/monitoring/events</code>.</p>
    </div>
  );
};

export default MonitoringTabContent;

