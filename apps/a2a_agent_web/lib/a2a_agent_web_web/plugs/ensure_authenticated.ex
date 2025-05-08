defmodule A2aAgentWebWeb.Plugs.EnsureAuthenticated do
  import Plug.Conn

  alias A2aAgentWeb.Auth.TokenService
  alias A2aAgentWeb.Accounts

  def init(opts), do: opts

  def call(conn, _opts) do
    case get_bearer_token(conn) do
      nil ->
        send_unauthorized(conn, "Missing authorization token")
      token ->
        case TokenService.verify_token(token) do
          {:ok, claims} ->
            case TokenService.get_user_id_from_claims(claims) do
              nil ->
                send_unauthorized(conn, "Invalid token: Missing user_id")
              user_id ->
                case Accounts.get_user!(user_id) do # Use get_user! to ensure user exists or raise
                  %Accounts.User{} = user ->
                    assign(conn, :current_user, user)
                  nil -> # Should not happen if get_user! is used, but as a safeguard
                    send_unauthorized(conn, "Invalid token: User not found")
                end
            end
          {:error, _reason} -> # E.g., :invalid_token, :expired_token
            send_unauthorized(conn, "Invalid or expired token")
        end
    end
  rescue
    Ecto.NoResultsError ->
      send_unauthorized(conn, "Invalid token: User not found")
  end

  defp get_bearer_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> token
      _ -> nil
    end
  end

  defp send_unauthorized(conn, message) do
    conn
    |> put_status(:unauthorized)
    |> put_resp_content_type("application/json")
    |> resp(401, Jason.encode!(%{errors: %{auth: [message]}}))
    |> halt()
  end
end

