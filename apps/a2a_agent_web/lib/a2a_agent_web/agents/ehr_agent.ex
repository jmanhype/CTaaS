defmodule A2aAgentWeb.Agents.EHRAgent do
  use GenServer
  alias A2aAgentWebWeb.EventBus
  require Logger

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    request_subject = "ctaas.v1.ehr.query.request"
    Logger.info("[EHRAgent] Initializing and subscribing to NATS subject: #{request_subject}")

    case EventBus.subscribe(request_subject) do
      {:ok, _sid} ->
        Logger.info("[EHRAgent] Successfully subscribed to #{request_subject}")
        {:ok, %{request_subject: request_subject}}
      {:error, reason} ->
        Logger.error("[EHRAgent] Failed to subscribe to #{request_subject}: #{inspect(reason)}")
        {:stop, {:failed_to_subscribe, reason}}
    end
  end

  @impl true
  def handle_info({:msg, %{body: payload, topic: subject, sid: _sid}}, state) do
    Logger.info("[EHRAgent] Received NATS message on subject \"#{subject}\": #{payload}")

    case Jason.decode(payload) do
      {:ok, data} ->
        handle_ehr_query_request(data, state)
      {:error, reason} ->
        Logger.error("[EHRAgent] Failed to decode JSON payload: #{inspect(reason)}. Payload: #{payload}")
    end
    {:noreply, state}
  end

  def handle_info(msg, state) do
    Logger.warn("[EHRAgent] Received unexpected message: #{inspect(msg)}")
    {:noreply, state}
  end

  defp handle_ehr_query_request(data, _state) do
    original_correlation_id = Map.get(data, "correlation_id", "corr-" <> Integer.to_string(System.unique_integer([:positive, :monotonic])))
    original_message_id = Map.get(data, "message_id", "unknown_original_msg_id")
    query_payload = Map.get(data, "payload", %{})
    trial_id = Map.get(query_payload, "trial_id", "UNKNOWN_TRIAL_ID")
    query_criteria = Map.get(query_payload, "query_criteria", %{})

    Logger.info("[EHRAgent] Processing ehr.query.request (original_msg_id: #{original_message_id}, corr_id: #{original_correlation_id}) for trial_id: #{trial_id} with criteria: #{inspect(query_criteria)}")

    # Simulate querying an EHR system (e.g., FHIR API)
    # In a real implementation, this would involve HTTP calls, data transformation, etc.
    mock_patient_data = query_mock_ehr(query_criteria)

    response_message_id = "msg-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))
    response_subject = "ctaas.v1.ehr.patient_data.retrieved"
    response_event_type = "ehr.patient_data.retrieved"

    response_payload_map = %{
      message_id: response_message_id,
      correlation_id: original_correlation_id,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      source_agent: "A2aAgentWeb.Agents.EHRAgent",
      event_type: response_event_type,
      payload: %{
        original_message_id: original_message_id,
        trial_id: trial_id,
        query_criteria: query_criteria,
        patients: mock_patient_data
      }
    }

    Logger.info("[EHRAgent] Publishing to NATS subject \"#{response_subject}\" with message: #{inspect(response_payload_map)}")
    EventBus.publish(response_payload_map, response_subject)
    Logger.info("[EHRAgent] Successfully published #{response_event_type} event to NATS with message_id: #{response_message_id}")
  end

  # Mock EHR query function
  defp query_mock_ehr(criteria) do
    Logger.info("[EHRAgent] Simulating EHR query with criteria: #{inspect(criteria)}")
    # Based on criteria, return some mock patient data
    # This is highly simplified
    cond = Map.get(criteria, "condition", "any")
    age_min = Map.get(criteria, "age_min", 0)

    all_patients = [
      %{ "patient_id" => "PAT001", "age" => 45, "conditions" => ["Hypertension", "Diabetes"], "gender" => "Female"},
      %{ "patient_id" => "PAT002", "age" => 50, "conditions" => ["Hypertension"], "gender" => "Male"},
      %{ "patient_id" => "PAT003", "age" => 35, "conditions" => ["Asthma"], "gender" => "Female"},
      %{ "patient_id" => "PAT004", "age" => 60, "conditions" => ["Hypertension", "Arthritis"], "gender" => "Male"}
    ]

    Enum.filter(all_patients, fn patient ->
      (cond == "any" || Enum.member?(patient["conditions"], cond)) &&
      (patient["age"] >= age_min)
    end)
  end
end

