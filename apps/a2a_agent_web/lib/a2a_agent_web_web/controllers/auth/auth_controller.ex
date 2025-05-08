defmodule A2aAgentWebWeb.Auth.AuthController do
  use A2aAgentWebWeb, :controller

  alias A2aAgentWeb.Accounts
  alias A2aAgentWeb.Auth.TokenService
  alias A2aAgentWeb.Accounts.User

  action_fallback A2aAgentWebWeb.FallbackController

  def register(conn, params) do
    case Accounts.create_user(params) do
      {:ok, user} ->
        conn
        |> put_status(:created)
        |> render("user.json", %{message: "User registered successfully", user: user})
      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:bad_request)
        |> render("errors.json", changeset: changeset)
    end
  end

  def login(conn, %{"email" => email, "password" => password}) do
    case Accounts.authenticate_user(email, password) do
      {:ok, user} ->
        case TokenService.generate_token(user) do
          {:ok, token} ->
            conn
            |> put_status(:ok)
            |> render("token.json", %{
              access_token: token,
              token_type: "bearer",
              user: user # Optional: include basic user info as per design
            })
          {:error, reason} ->
            conn
            |> put_status(:internal_server_error)
            |> render("errors.json", %{errors: %{token: ["Failed to generate token: #{inspect(reason)}"]}})
        end
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> render("errors.json", %{errors: %{credentials: ["Invalid email or password"]}})
    end
  end

  def login(conn, _params) do
    conn
    |> put_status(:bad_request)
    |> render("errors.json", %{errors: %{params: ["Missing email or password"]}})
  end

  # Logout can be simple for stateless JWTs. Client handles token removal.
  # If token denylisting is implemented, this endpoint would interact with that service.
  def logout(conn, _params) do
    # For now, we just confirm logout. Client should discard the token.
    conn
    |> put_status(:ok)
    |> render("message.json", %{message: "Logout successful"})
  end
end

