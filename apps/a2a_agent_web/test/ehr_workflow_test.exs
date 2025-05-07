# /home/ubuntu/hypergraph_agents_umbrella/apps/a2a_agent_web/test/ehr_workflow_test.exs

# Ensure application is started if running this script directly
Application.ensure_all_started(:a2a_agent_web)

# Alias for easier access to EventBus and services
alias A2aAgentWebWeb.EventBus
alias A2aAgentWeb.ProtocolService # Using ProtocolService to initiate, or a new dedicated service
require Logger

Logger.info("[EHR Workflow Test] Starting EHR workflow test script.")

# 1. Define the EHR query request payload
ehr_query_payload = %{
  trial_id: "EHR_TEST_001",
  query_criteria: %{
    condition: "Hypertension",
    age_min: 40
  }
}

# 2. Prepare the NATS message for EHR query
correlation_id = "corr-ehr-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))
message_id = "msg-ehr-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))

ehr_query_request_event = %{
  message_id: message_id,
  correlation_id: correlation_id,
  timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
  source_agent: "A2aAgentWeb.TestScript.EHRWorkflow",
  event_type: "ehr.query.request",
  payload: ehr_query_payload
}

ehr_query_subject = "ctaas.v1.ehr.query.request"

# 3. Publish the EHR query request to NATS
Logger.info("[EHR Workflow Test] Publishing EHR query request to NATS subject \"#{ehr_query_subject}\": #{inspect(ehr_query_request_event)}")

case EventBus.publish(ehr_query_request_event, ehr_query_subject) do
  :ok ->
    Logger.info("[EHR Workflow Test] Successfully published ehr.query.request event to NATS with message_id: #{message_id}")
  {:error, reason} ->
    Logger.error("[EHR Workflow Test] Failed to publish ehr.query.request event: #{inspect(reason)}")
end

Logger.info("[EHR Workflow Test] Check application logs for NATS messages and EHRAgent activity.")
Logger.info("[EHR Workflow Test] Expected flow: TestScript -> NATS -> EHRAgent -> NATS -> (Potentially another agent for patient matching - not yet implemented in this test)")

# Allow some time for asynchronous processing by agents
Logger.info("[EHR Workflow Test] Waiting for 10 seconds for agent processing...")
Process.sleep(10_000) # Wait for 10 seconds

Logger.info("[EHR Workflow Test] Test script finished. Monitor logs for asynchronous agent processing.")
Logger.info("[EHR Workflow Test] Exiting after delay.")

