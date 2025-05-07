defmodule A2aAgentWeb.ProtocolService do
  alias A2aAgentWebWeb.EventBus
  require Logger

  @doc """
  Initiates the protocol drafting process by publishing an event to NATS.
  `params` should be a map containing initial parameters for the protocol draft,
  e.g., %{trial_id: "TRIAL123", sponsor_id: "SPONSOR_ABC", therapeutic_area: "Oncology"}
  """
  def initiate_protocol_draft(params) do
    correlation_id = "corr-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))
    message_id = "msg-" <> Integer.to_string(System.unique_integer([:positive, :monotonic]))

    message = %{
      message_id: message_id,
      correlation_id: correlation_id,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      source_agent: "A2aAgentWeb.ProtocolService",
      event_type: "protocol.draft.request",
      payload: params
    }

    subject = "ctaas.v1.protocol.draft.request"

    Logger.info("Publishing to NATS subject '#{subject}' with message: #{inspect(message)}")
    case EventBus.publish(message, subject) do
      :ok ->
        Logger.info("Successfully published protocol.draft.request event to NATS with message_id: #{message_id}")
        {:ok, %{message_id: message_id, correlation_id: correlation_id}}
      {:error, reason} ->
        Logger.error("Failed to publish message to NATS: #{inspect(reason)}")
        {:error, :nats_publish_failed}
    end
  end
end

