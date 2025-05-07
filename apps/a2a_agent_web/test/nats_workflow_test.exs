# /home/ubuntu/hypergraph_agents_umbrella/apps/a2a_agent_web/test/nats_workflow_test.exs
require Logger

# Ensure application is started if running this script directly
Application.ensure_all_started(:a2a_agent_web)

Logger.info("[NATS Workflow Test] Starting test...")

# Give NATS and agents a moment to initialize if the app was just started
Process.sleep(2000)

# Parameters for initiating the protocol draft
test_params = %{
  trial_id: "NATS_TEST_001",
  sponsor_id: "MANUS_AI_SPONSOR",
  therapeutic_area: "AI Agent Orchestration",
  phase: "Phase I",
  key_objectives: ["Validate NATS messaging", "Test agent interaction"]
}

Logger.info("[NATS Workflow Test] Calling ProtocolService.initiate_protocol_draft with params: #{inspect(test_params)}")

case A2aAgentWeb.ProtocolService.initiate_protocol_draft(test_params) do
  {:ok, result} ->
    Logger.info("[NATS Workflow Test] ProtocolService.initiate_protocol_draft returned: {:ok, #{inspect(result)}}")
    Logger.info("[NATS Workflow Test] Check application logs for NATS messages and agent activity.")
    Logger.info("[NATS Workflow Test] Expected flow: ProtocolService -> NATS -> ProtocolAgent -> NATS -> LLMAgent -> NATS -> (ProtocolAgent for final processing - not yet implemented)")
  {:error, reason} ->
    Logger.error("[NATS Workflow Test] ProtocolService.initiate_protocol_draft failed: {:error, #{inspect(reason)}}")
end

Logger.info("[NATS Workflow Test] Test script finished. Monitor logs for asynchronous agent processing.")

# Keep the script alive for a bit to allow NATS messages to flow and be logged if running within a short-lived `mix run`
# In a real test suite or long-running app, this wouldn't be necessary.
Process.sleep(10000)
Logger.info("[NATS Workflow Test] Exiting after delay.")

