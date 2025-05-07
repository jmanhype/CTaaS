defmodule A2aAgentWeb.Agents.ProtocolAgent do
  use GenServer
  alias A2aAgentWebWeb.EventBus
  require Logger

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    subject = "ctaas.v1.protocol.draft.request"
    Logger.info("[ProtocolAgent] Initializing and subscribing to NATS subject: #{subject}")
    
    # EventBus.subscribe/1 will use self() to send messages to this GenServer's handle_info
    case EventBus.subscribe(subject) do
      {:ok, _sid} -> # Gnat.sub returns {:ok, sid} or {:error, reason}
        Logger.info("[ProtocolAgent] Successfully subscribed to #{subject}")
        {:ok, %{subject: subject}}
      {:error, reason} ->
        Logger.error("[ProtocolAgent] Failed to subscribe to #{subject}: #{inspect(reason)}")
        {:stop, {:failed_to_subscribe, reason}}
    end
  end

  @impl true
  def handle_info({:msg, %{body: payload, topic: subject, sid: _sid}}, state) do # Matched Gnat message format
    Logger.info("[ProtocolAgent] Received NATS message on subject \"#{subject}\": #{payload}")

    case Jason.decode(payload) do
      {:ok, data} ->
        handle_protocol_draft_request(data, state)
      {:error, reason} ->
        Logger.error("[ProtocolAgent] Failed to decode JSON payload: #{inspect(reason)}. Payload: #{payload}")
    end
    {:noreply, state}
  end

  # Catch-all for other messages
  def handle_info(msg, state) do
    Logger.warn("[ProtocolAgent] Received unexpected message: #{inspect(msg)}")
    {:noreply, state}
  end

  defp handle_protocol_draft_request(data, state) do
    original_correlation_id = Map.get(data, "correlation_id", "corr-" <> Integer.to_string(System.unique_integer([:positive, :monotonic])))
    original_message_id = Map.get(data, "message_id", "unknown_original_msg_id")
    trial_params = Map.get(data, "payload", %{})

    Logger.info("[ProtocolAgent] Processing protocol.draft.request (original_msg_id: #{original_message_id}, corr_id: #{original_correlation_id}) with params: #{inspect(trial_params)}")

    # Prepare mock LLM input
    llm_input_text = "Based on trial parameters: #{inspect(trial_params)}, generate a detailed clinical trial protocol focusing on inclusion/exclusion criteria and study objectives."

    new_message_id = "msg-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))
    llm_input_message = %{
      message_id: new_message_id,
      correlation_id: original_correlation_id, # Carry over the correlation ID
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      source_agent: "A2aAgentWeb.Agents.ProtocolAgent",
      event_type: "protocol.llm.input.prepared",
      payload: %{
        original_message_id: original_message_id,
        trial_params: trial_params,
        llm_prompt: llm_input_text,
        target_llm: "gpt-4o" # Example
      }
    }

    llm_input_subject = "ctaas.v1.protocol.llm.input.prepared"

    case Jason.encode(llm_input_message) do
      {:ok, _json_payload} -> # json_payload no longer directly used here, EventBus.publish handles it
        Logger.info("[ProtocolAgent] Publishing to NATS subject \"#{llm_input_subject}\" with message: #{inspect(llm_input_message)}")
        # EventBus.publish/2 expects the event map and the subject
        # The EventBus module itself handles JSON encoding and the NATS connection name
        EventBus.publish(llm_input_message, llm_input_subject)
        Logger.info("[ProtocolAgent] Successfully published protocol.llm.input.prepared event to NATS with message_id: #{new_message_id}")
      {:error, reason} ->
        Logger.error("[ProtocolAgent] Failed to encode LLM input message for NATS (this shouldn't happen if EventBus handles encoding): #{inspect(reason)}")
    end
  end
end

