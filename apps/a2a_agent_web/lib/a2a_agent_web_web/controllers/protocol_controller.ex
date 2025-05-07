defmodule A2aAgentWebWeb.ProtocolController do
  use A2aAgentWebWeb, :controller
  # Assuming a context module for Protocols, e.g., A2aAgentWeb.Protocols
  # And a service for interacting with agents, e.g., A2aAgentWeb.ProtocolService
  alias A2aAgentWeb.ProtocolService
  require Logger

  action_fallback A2aAgentWebWeb.FallbackController

  def draft(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[ProtocolController] Received protocol draft request for trial_id: #{trial_id} with params: #{inspect(params)}")
    
    # Extract relevant parameters for protocol generation if provided in request body
    protocol_params = Map.get(params, "protocol_details", %{ # Default to empty map if no specific details
      key_objectives: ["Default objective 1", "Default objective 2"],
      phase: "Phase II", # Example default
      sponsor_id: "SPONSOR_XYZ", # Example default
      therapeutic_area: "General Medicine" # Example default
    })

    # Initiate asynchronous protocol drafting via an agent/service
    # This would typically involve NATS messaging to the ProtocolAgent
    case ProtocolService.initiate_protocol_draft(trial_id, protocol_params) do
      {:ok, task_info} -> # task_info might contain a task_id
        conn
        |> put_status(:accepted) # 202 Accepted for async operations
        |> json(%{data: %{message: "Protocol drafting initiated.", task_id: Map.get(task_info, :task_id, "task_" <> Ecto.UUID.generate())}})
      {:error, reason} ->
        Logger.error("[ProtocolController] Failed to initiate protocol draft: #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: %{message: "Failed to initiate protocol drafting: #{inspect(reason)}"}})
    end
  end

  def index(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[ProtocolController] Received protocol index request for trial_id: #{trial_id} with params: #{inspect(params)}")
    # mock_protocols = Protocols.list_protocols_for_trial(trial_id, params)
    mock_protocols = [
      %{id: "proto_abc123", trial_id: trial_id, version: "1.0", status: "approved"},
      %{id: "proto_def456", trial_id: trial_id, version: "0.9", status: "draft"}
    ]
    conn
    |> put_status(:ok)
    |> json(%{data: mock_protocols})
  end

  def show(conn, %{"trial_id" => trial_id, "protocol_id" => protocol_id} = params) do
    Logger.info("[ProtocolController] Received protocol show request for trial_id: #{trial_id}, protocol_id: #{protocol_id} with params: #{inspect(params)}")
    # mock_protocol = Protocols.get_protocol!(protocol_id)
    mock_protocol = %{id: protocol_id, trial_id: trial_id, version: "1.0", status: "approved", content: "Full protocol content for #{protocol_id}"}
    conn
    |> put_status(:ok)
    |> json(%{data: mock_protocol})
  end

  def generation_status(conn, %{"task_id" => task_id} = params) do
    Logger.info("[ProtocolController] Received protocol generation status request for task_id: #{task_id} with params: #{inspect(params)}")
    # status = ProtocolService.get_generation_status(task_id)
    # Mocking status
    mock_status = case rem(System.monotonic_time(:millisecond), 3) do
      0 -> "PENDING"
      1 -> "IN_PROGRESS"
      2 -> "COMPLETED"
    end
    mock_response = %{task_id: task_id, status: mock_status}
    mock_response = if mock_status == "COMPLETED", do: Map.put(mock_response, :protocol_url, "/api/v1/trials/some_trial/protocols/proto_generated_123"), else: mock_response

    conn
    |> put_status(:ok)
    |> json(%{data: mock_response})
  end
end

