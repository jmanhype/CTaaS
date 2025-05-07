defmodule A2aAgentWebWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :a2a_agent_web

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_a2a_agent_web_key",
    signing_salt: "B+U2joWu",
    same_site: "Lax"
  ]

  # Serve at "/" the static files from "priv/static/frontend_assets" directory.
  # This will serve the Next.js frontend.
  plug Plug.Static,
    at: "/",
    from: {:a2a_agent_web, "priv/static/frontend_assets"},
    gzip: false,
    # only_matching: ["_next", "static", "images", "favicon.ico", "manifest.json", "robots.txt", "sw.js"], # Adjust as needed
    # spa: true, # Enable if you want Phoenix to handle SPA routing (serving index.html for unmatched paths)
    # index_html: "index.html" # Ensure this points to your Next.js entry point
    only: ~w(css fonts images js favicon.ico robots.txt index.html _next sw.js manifest.json)

  # Serve at "/backend_assets" the static files from "priv/static" directory (original Phoenix assets).
  # This is if you still have Phoenix-specific static assets you need to serve separately.
  # If not, you can remove this or adjust the `at` path.
  plug Plug.Static,
    at: "/backend_assets",
    from: :a2a_agent_web,
    gzip: false,
    only: A2aAgentWebWeb.static_paths()

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug CORSPlug, origin: ["http://localhost:3000"], max_age: 86400

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options

  plug A2aAgentWebWeb.Router
end

