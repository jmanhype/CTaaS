defmodule A2aAgentWeb.Repo do
  use Ecto.Repo, 
    otp_app: :a2a_agent_web,
    adapter: Ecto.Adapters.Postgres
end

