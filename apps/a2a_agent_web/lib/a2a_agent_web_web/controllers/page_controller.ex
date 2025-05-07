defmodule A2aAgentWebWeb.PageController do
  use A2aAgentWebWeb, :controller

  def spa_index(conn, _params) do
    # Serve the main index.html file for the Next.js SPA
    # Ensure this path correctly points to your Next.js build's entry HTML file
    # within the directory configured in Plug.Static for the frontend assets.
    conn
    |> put_resp_content_type("text/html")
    |> send_file(200, "priv/static/frontend_assets/index.html")
  end

  # If you had an old PageController index action for Phoenix templates, 
  # it's now superseded by spa_index for the root path if you want SPA at root.
  # If you need to keep it for other purposes, ensure routing is distinct.
  # def index(conn, _params) do
  #   render(conn, :index)
  # end
end

