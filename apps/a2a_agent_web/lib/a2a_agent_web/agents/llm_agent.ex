defmodule A2aAgentWeb.Agents.LLMAgent do
  use GenServer
  alias A2aAgentWebWeb.EventBus
  require Logger
  # Assuming an HTTP client like Req is available and configured
  # For actual OpenAI calls, ensure Req is in deps and an HTTP client process is started (e.g., Finch)

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    subject = "ctaas.v1.protocol.llm.input.prepared"
    Logger.info("[LLMAgent] Initializing and subscribing to NATS subject: #{subject}")
    
    # EventBus.subscribe/1 will use self() to send messages to this GenServer's handle_info
    case EventBus.subscribe(subject) do
      {:ok, _sid} -> # Gnat.sub returns {:ok, sid} or {:error, reason}
        Logger.info("[LLMAgent] Successfully subscribed to #{subject}")
        openai_api_key = System.get_env("OPENAI_API_KEY")
        if is_nil(openai_api_key) do
          Logger.warn("[LLMAgent] OPENAI_API_KEY environment variable is not set. LLM calls will be mocked.")
        end
        {:ok, %{subject: subject, openai_api_key: openai_api_key}}
      {:error, reason} ->
        Logger.error("[LLMAgent] Failed to subscribe to #{subject}: #{inspect(reason)}")
        {:stop, {:failed_to_subscribe, reason}}
    end
  end

  @impl true
  def handle_info({:msg, %{body: payload, topic: subject, sid: _sid}}, state) do # Matched Gnat message format
    Logger.info("[LLMAgent] Received NATS message on subject \"#{subject}\": #{payload}")

    case Jason.decode(payload) do
      {:ok, data} ->
        handle_llm_input_prepared(data, state)
      {:error, reason} ->
        Logger.error("[LLMAgent] Failed to decode JSON payload: #{inspect(reason)}. Payload: #{payload}")
    end
    {:noreply, state}
  end

  # Catch-all for other messages
  def handle_info(msg, state) do
    Logger.warn("[LLMAgent] Received unexpected message: #{inspect(msg)}")
    {:noreply, state}
  end

  defp handle_llm_input_prepared(data, state) do
    original_correlation_id = Map.get(data, "correlation_id")
    original_message_id = Map.get(data, "message_id")
    llm_payload = Map.get(data, "payload", %{})
    prompt = Map.get(llm_payload, "llm_prompt", "No prompt provided.")
    model = Map.get(llm_payload, "target_llm", "gpt-4o") # Or your preferred model

    Logger.info("[LLMAgent] Processing llm.input.prepared (original_msg_id: #{original_message_id}, corr_id: #{original_correlation_id}) with prompt: \"#{prompt}\"")

    llm_output = 
      if state.openai_api_key do
        Logger.info("[LLMAgent] Making call to OpenAI with prompt: #{prompt} using model: #{model}")
        call_openai_api(prompt, model, state.openai_api_key)
      else
        Logger.warn("[LLMAgent] Mocking LLM call as API key is not set.")
        {:ok, "This is a MOCKED LLM response to the prompt: '#{prompt}'. API key was not available."}
      end

    new_message_id = "msg-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))
    llm_output_subject = "ctaas.v1.protocol.llm.output.received"
    output_event_type = if elem(llm_output, 0) == :ok, do: "protocol.llm.output.received", else: "protocol.llm.output.failed"

    response_payload = %{
      message_id: new_message_id,
      correlation_id: original_correlation_id,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      source_agent: "A2aAgentWeb.Agents.LLMAgent",
      event_type: output_event_type,
      payload: case llm_output do
                 {:ok, content} -> %{original_message_id: original_message_id, llm_response_content: content}
                 {:error, error_reason} -> %{original_message_id: original_message_id, error: inspect(error_reason)}
               end
    }

    case Jason.encode(response_payload) do
      {:ok, json_response_payload} ->
        Logger.info("[LLMAgent] Publishing to NATS subject \"#{llm_output_subject}\" with payload: #{json_response_payload}")
        EventBus.publish(response_payload, llm_output_subject)
        Logger.info("[LLMAgent] Successfully published #{output_event_type} event to NATS with message_id: #{new_message_id}")
      {:error, reason} ->
        Logger.error("[LLMAgent] Failed to encode LLM output message for NATS: #{inspect(reason)}")
    end
  end

  # Actual OpenAI API call logic
  defp call_openai_api(prompt, model, api_key) do
    headers = [
      {"Authorization", "Bearer #{api_key}"},
      {"Content-Type", "application/json"}
    ]
    body = Jason.encode!(%{model: model, messages: [%{role: "user", content: prompt}]})
    
    # Ensure Req is started. This might be better handled in application startup or a dedicated HTTP client module.
    # For simplicity here, we assume Req is available and started.
    # Consider adding Req to your application's supervision tree if not already.
    case Req.post("https://api.openai.com/v1/chat/completions", body: body, headers: headers) do
      {:ok, %{status: 200, body: response_body}} -> 
        case Jason.decode(response_body) do
           {:ok, decoded_body} -> 
             # Safely access nested keys
             choices = Map.get(decoded_body, "choices", [])
             first_choice = List.first(choices)
             message = if first_choice, do: Map.get(first_choice, "message"), else: nil
             content = if message, do: Map.get(message, "content"), else: "Error: Could not extract content from LLM response."
             {:ok, content}
           {:error, _} -> 
             Logger.error("[LLMAgent] Failed to decode JSON from OpenAI response: #{response_body}")
             {:error, :openai_json_decode_failed}
        end
      {:ok, %{status: status_code, body: error_body}} -> 
        Logger.error("[LLMAgent] OpenAI API request failed with status #{status_code}: #{inspect(error_body)}")
        {:error, {:openai_api_error, status_code, error_body}}
      {:error, reason} -> 
        Logger.error("[LLMAgent] OpenAI API request failed: #{inspect(reason)}")
        {:error, {:openai_request_failed, reason}}
    end
  end
end

