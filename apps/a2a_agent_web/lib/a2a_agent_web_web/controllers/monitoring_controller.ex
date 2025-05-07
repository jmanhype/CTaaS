defmodule A2aAgentWebWeb.MonitoringController do
  use A2aAgentWebWeb, :controller
  # Assuming a context module for Monitoring, e.g., A2aAgentWeb.Monitoring
  require Logger

  action_fallback A2aAgentWebWeb.FallbackController

  # GET /api/v1/trials/:trial_id/monitoring/summary
  def summary(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[MonitoringController] Received monitoring summary request for trial_id: #{trial_id} with params: #{inspect(params)}")
    # mock_summary = Monitoring.get_trial_summary(trial_id)
    mock_summary = %{
      trial_id: trial_id,
      total_patients_enrolled: Enum.random(50..200),
      sites_active: Enum.random(5..15),
      data_queries_outstanding: Enum.random(0..10),
      adverse_events_reported: Enum.random(0..5)
    }
    conn
    |> put_status(:ok)
    |> json(%{data: mock_summary})
  end

  # GET /api/v1/trials/:trial_id/monitoring/events
  def events(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[MonitoringController] Received monitoring events request for trial_id: #{trial_id} with params: #{inspect(params)}")
    # mock_events = Monitoring.get_trial_events(trial_id, params) # With filtering/pagination
    mock_events = [
      %{event_id: "evt_001", timestamp: DateTime.utc_now() |> DateTime.add(-3600, :second) |> DateTime.to_iso8601(), type: "SAE_REPORTED", severity: "HIGH", details: "Serious adverse event reported at site X."},
      %{event_id: "evt_002", timestamp: DateTime.utc_now() |> DateTime.add(-7200, :second) |> DateTime.to_iso8601(), type: "PROTOCOL_DEVIATION", severity: "MEDIUM", details: "Protocol deviation noted for patient Y."}
    ]
    conn
    |> put_status(:ok)
    |> json(%{data: mock_events})
  end
end

