defmodule A2aAgentWeb.Auth.TokenService do
  @moduledoc """
  Handles JWT generation and verification.
  """
  alias A2aAgentWeb.Accounts.User
  alias Joken

  # Fetch the secret key from application configuration
  # Ensure this is set in your config/config.exs or runtime.exs
  # For example: config :a2a_agent_web, :joken, secret_key: "your-super-secret-key"
  # It's better to use System.get_env for production secrets.
  @joken_secret Application.get_env(:a2a_agent_web, :joken, [])[:secret_key] || "fallback-secret-key-replace-this"

  @doc """
  Generates a JWT for a given user.
  """
  def generate_token(%User{} = user) do
    # Default claims: exp, iat, iss, aud, jti, nbf
    # We will add a custom claim for user_id and roles
    claims = %{
      user_id: user.id,
      roles: user.roles,
      # Standard claims - Joken can add some of these automatically
      # exp: DateTime.add(DateTime.utc_now(), 3600, :second) |> DateTime.to_unix(), # Example: 1 hour expiry
      # iss: "CTaaSServer",
      # aud: "CTaaSClient"
    }

    # Joken.Signer can be configured globally or passed here
    # Using a default signer for simplicity here, but configure it properly in config.exs
    signer = Joken.Signer.create("HS256", @joken_secret)

    case Joken.generate_and_sign(claims, nil, signer) do
      {:ok, token, _full_claims} -> {:ok, token}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Verifies a JWT string and returns the claims if valid.
  """
  def verify_token(token_string) when is_binary(token_string) do
    signer = Joken.Signer.create("HS256", @joken_secret)
    # Joken.verify/3 can take a Joken.Verifier or a Joken.Signer
    case Joken.verify(token_string, nil, signer) do
      {:ok, claims} -> {:ok, claims}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Extracts the user_id from verified token claims.
  """
  def get_user_id_from_claims(claims) when is_map(claims) do
    Map.get(claims, "user_id") # Joken stringifies atom keys by default
  end
end

